-- AnimusWriter Database Schema - Phase 1
-- Run this in your Supabase SQL Editor

-- Enable Row Level Security
ALTER DATABASE postgres SET timezone TO 'UTC';

-- Create documents table for writing sessions
CREATE TABLE IF NOT EXISTS documents (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    title TEXT,
    content TEXT DEFAULT '',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    word_count INTEGER DEFAULT 0,
    is_reviewed BOOLEAN DEFAULT false
);

-- Create suggestions table for AI feedback
CREATE TABLE IF NOT EXISTS suggestions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    document_id UUID REFERENCES documents(id) ON DELETE CASCADE NOT NULL,
    type TEXT NOT NULL, -- 'grammar', 'spelling', 'style'
    text_range JSONB NOT NULL, -- {start: number, end: number}
    original_text TEXT NOT NULL,
    suggestion TEXT NOT NULL,
    explanation TEXT,
    status TEXT DEFAULT 'pending', -- 'pending', 'accepted', 'rejected'
    user_feedback TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create user_preferences table for settings
CREATE TABLE IF NOT EXISTS user_preferences (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    preferred_feedback_style TEXT DEFAULT 'balanced', -- 'minimal', 'balanced', 'detailed'
    writing_goals TEXT[],
    auto_save_interval INTEGER DEFAULT 10, -- seconds
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS documents_user_id_created_at_idx ON documents(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS suggestions_document_id_idx ON suggestions(document_id);
CREATE INDEX IF NOT EXISTS suggestions_status_idx ON suggestions(status);

-- Enable Row Level Security (RLS)
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE suggestions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Documents: Users can only access their own documents
CREATE POLICY "Users can view their own documents" ON documents
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own documents" ON documents
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own documents" ON documents
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own documents" ON documents
    FOR DELETE USING (auth.uid() = user_id);

-- Suggestions: Users can only access suggestions for their documents
CREATE POLICY "Users can view suggestions for their documents" ON suggestions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM documents 
            WHERE documents.id = suggestions.document_id 
            AND documents.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert suggestions for their documents" ON suggestions
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM documents 
            WHERE documents.id = suggestions.document_id 
            AND documents.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update suggestions for their documents" ON suggestions
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM documents 
            WHERE documents.id = suggestions.document_id 
            AND documents.user_id = auth.uid()
        )
    );

-- User preferences: Users can only access their own preferences
CREATE POLICY "Users can view their own preferences" ON user_preferences
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own preferences" ON user_preferences
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own preferences" ON user_preferences
    FOR UPDATE USING (auth.uid() = user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_documents_updated_at 
    BEFORE UPDATE ON documents 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_preferences_updated_at 
    BEFORE UPDATE ON user_preferences 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create function to automatically update word count
CREATE OR REPLACE FUNCTION update_word_count()
RETURNS TRIGGER AS $$
BEGIN
    NEW.word_count = array_length(string_to_array(trim(NEW.content), ' '), 1);
    -- Handle empty content case
    IF NEW.content = '' OR NEW.content IS NULL THEN
        NEW.word_count = 0;
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for word count
CREATE TRIGGER update_documents_word_count 
    BEFORE INSERT OR UPDATE ON documents 
    FOR EACH ROW EXECUTE FUNCTION update_word_count(); 