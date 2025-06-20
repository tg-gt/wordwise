-- Phase 2: Persona System Database Schema
-- Run this migration after 001_initial_schema.sql

-- Create personas table for persona definitions
CREATE TABLE IF NOT EXISTS personas (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    type TEXT NOT NULL, -- 'twitter_naval', 'twitter_pg', 'twitter_elon', 'anima', 'animus'
    name TEXT NOT NULL,
    image_url TEXT,
    base_prompt TEXT NOT NULL, -- archetypal prompt for this persona type
    customization_details JSONB DEFAULT '{}', -- JSON field for light personalization
    is_active BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create persona_outputs table for storing persona feedback/insights
CREATE TABLE IF NOT EXISTS persona_outputs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    document_id UUID REFERENCES documents(id) ON DELETE CASCADE NOT NULL,
    persona_id UUID REFERENCES personas(id) ON DELETE CASCADE NOT NULL,
    output_content TEXT NOT NULL, -- tweet text, insight, or feedback
    output_type TEXT NOT NULL, -- 'tweet', 'insight', 'challenge', 'encouragement'
    reasoning TEXT, -- why this output was generated
    user_rating INTEGER, -- thumbs up/down: 1 for up, -1 for down, null for no rating
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS personas_user_id_type_idx ON personas(user_id, type);
CREATE INDEX IF NOT EXISTS personas_user_id_active_idx ON personas(user_id, is_active);
CREATE INDEX IF NOT EXISTS persona_outputs_document_id_idx ON persona_outputs(document_id);
CREATE INDEX IF NOT EXISTS persona_outputs_persona_id_idx ON persona_outputs(persona_id);

-- Enable Row Level Security (RLS)
ALTER TABLE personas ENABLE ROW LEVEL SECURITY;
ALTER TABLE persona_outputs ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for personas
CREATE POLICY "Users can view their own personas" ON personas
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own personas" ON personas
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own personas" ON personas
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own personas" ON personas
    FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for persona_outputs
CREATE POLICY "Users can view persona outputs for their documents" ON persona_outputs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM documents 
            WHERE documents.id = persona_outputs.document_id 
            AND documents.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert persona outputs for their documents" ON persona_outputs
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM documents 
            WHERE documents.id = persona_outputs.document_id 
            AND documents.user_id = auth.uid()
        ) AND
        EXISTS (
            SELECT 1 FROM personas
            WHERE personas.id = persona_outputs.persona_id
            AND personas.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update persona outputs for their documents" ON persona_outputs
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM documents 
            WHERE documents.id = persona_outputs.document_id 
            AND documents.user_id = auth.uid()
        ) AND
        EXISTS (
            SELECT 1 FROM personas
            WHERE personas.id = persona_outputs.persona_id
            AND personas.user_id = auth.uid()
        )
    ); 