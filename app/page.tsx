import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AuthButton } from "@/components/auth-button";
import { ThemeSwitcher } from "@/components/theme-switcher";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  PenTool, 
  Brain, 
  FileText, 
  Sparkles, 
  CheckCircle,
  Zap,
  Target,
  MessageSquare
} from "lucide-react";

export default async function Home() {
  const supabase = await createClient();
  
  // Check if user is authenticated
  const { data } = await supabase.auth.getUser();
  
  // Redirect authenticated users to the writing interface
  if (data?.user) {
    redirect("/write");
  }

  return (
    <main className="min-h-screen flex flex-col">
      {/* Navigation */}
      <nav className="w-full flex justify-center border-b border-b-foreground/10 h-16">
        <div className="w-full max-w-6xl flex justify-between items-center p-3 px-5 text-sm">
          <div className="flex gap-5 items-center font-semibold">
            <Link href={"/"} className="flex items-center gap-2">
              <PenTool className="w-6 h-6" />
              <span className="text-xl">AnimusWriter</span>
            </Link>
          </div>
          <AuthButton />
        </div>
      </nav>

      {/* Hero Section */}
      <section className="flex-1 flex flex-col items-center justify-center px-4 py-20 text-center">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="space-y-4">
            <Badge variant="secondary" className="mb-4">
              <Sparkles className="w-4 h-4 mr-1" />
              AI-Powered Writing Assistant
            </Badge>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
              Tweet Better with{" "}
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                AI Feedback
              </span>
            </h1>
            
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              AnimusWriter harnesses the power of Jung&apos;s <strong>Anima & Animus</strong> archetypes alongside AI personas to transform your writing. 
              Balance intuitive creativity with strategic clarity while getting real-time grammar and style improvements.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button asChild size="lg" className="text-lg px-8 py-6">
              <Link href="/auth/sign-up">
                <PenTool className="w-5 h-5 mr-2" />
                Start Writing Free
              </Link>
            </Button>
            
            <Button asChild variant="outline" size="lg" className="text-lg px-8 py-6">
              <Link href="/auth/login">
                Sign In
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Anima & Animus Section */}
      <section className="py-20 px-4 bg-gradient-to-b from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4 text-sm">
              <Brain className="w-4 h-4 mr-2" />
              Jungian Psychology Meets AI
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold mb-6">
              The Power of <span className="text-blue-600">Anima</span> & <span className="text-purple-600">Animus</span>
            </h2>
                         <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
               Based on Carl Jung&apos;s archetypal psychology, AnimusWriter provides you with two complementary AI voices 
               that mirror the dual nature of human consciousness and creativity.
             </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8 mb-12">
            <Card className="border-0 shadow-xl bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/50 dark:to-blue-900/30">
              <CardHeader className="pb-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                    <span className="text-2xl">🌙</span>
                  </div>
                  <div>
                    <CardTitle className="text-2xl text-blue-700 dark:text-blue-300">Anima</CardTitle>
                    <p className="text-sm text-blue-600 dark:text-blue-400">The Creative Intuitive</p>
                  </div>
                </div>
                <CardDescription className="text-base leading-relaxed">
                  Your <strong>Anima</strong> provides intuitive wisdom and emotional insight. It nurtures your creative voice, 
                  encourages authentic self-expression, and helps you tap into deeper patterns of meaning. 
                  Think of it as your inner muse—offering gentle guidance about what wants to emerge from your unconscious creativity.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-blue-700 dark:text-blue-300">
                    <CheckCircle className="w-4 h-4" />
                    <span>Creative encouragement & flow</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-blue-700 dark:text-blue-300">
                    <CheckCircle className="w-4 h-4" />
                    <span>Emotional depth & authenticity</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-blue-700 dark:text-blue-300">
                    <CheckCircle className="w-4 h-4" />
                    <span>Intuitive pattern recognition</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-blue-700 dark:text-blue-300">
                    <CheckCircle className="w-4 h-4" />
                    <span>Inner knowing & wisdom</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-xl bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/50 dark:to-purple-900/30">
              <CardHeader className="pb-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-2xl">⚡</span>
                  </div>
                  <div>
                    <CardTitle className="text-2xl text-purple-700 dark:text-purple-300">Animus</CardTitle>
                    <p className="text-sm text-purple-600 dark:text-purple-400">The Strategic Challenger</p>
                  </div>
                </div>
                <CardDescription className="text-base leading-relaxed">
                  Your <strong>Animus</strong> analyzes with rational clarity and goal-oriented feedback. It challenges you to grow, 
                  provides strategic thinking, and turns insights into actionable steps. 
                  Think of it as your inner critic—direct but supportive, asking &quot;is this just a skill issue?&quot; and pushing you forward.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-purple-700 dark:text-purple-300">
                    <CheckCircle className="w-4 h-4" />
                    <span>Strategic thinking & structure</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-purple-700 dark:text-purple-300">
                    <CheckCircle className="w-4 h-4" />
                    <span>Constructive challenges</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-purple-700 dark:text-purple-300">
                    <CheckCircle className="w-4 h-4" />
                    <span>Accountability for growth</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-purple-700 dark:text-purple-300">
                    <CheckCircle className="w-4 h-4" />
                    <span>Action-oriented insights</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="text-center">
            <Card className="inline-block border-0 shadow-lg bg-gradient-to-r from-blue-50 via-white to-purple-50 dark:from-blue-950/30 dark:via-background dark:to-purple-950/30 px-8 py-6">
              <div className="flex items-center gap-4">
                <div className="text-4xl">🌙</div>
                <div className="text-2xl font-bold text-muted-foreground">+</div>
                <div className="text-4xl">⚡</div>
                <div className="text-2xl font-bold text-muted-foreground">=</div>
                <div className="text-left">
                  <p className="font-semibold text-lg">Balanced Writing</p>
                  <p className="text-sm text-muted-foreground">Creative intuition meets strategic clarity</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Everything you need to write better
            </h2>
            <p className="text-xl text-muted-foreground">
              Powerful AI tools designed to enhance your writing process
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <Brain className="w-10 h-10 text-blue-600 mb-2" />
                <CardTitle>Anima & Animus Insights</CardTitle>
                <CardDescription>
                  Experience balanced feedback from your Anima (creative intuition) and Animus (strategic clarity), 
                  plus insights from Twitter thought leaders like Naval and Paul Graham.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CheckCircle className="w-10 h-10 text-green-600 mb-2" />
                <CardTitle>Smart Grammar & Style</CardTitle>
                <CardDescription>
                  Real-time analysis catches grammar, spelling, and style issues 
                  with detailed explanations and one-click fixes.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardHeader>
                <FileText className="w-10 h-10 text-purple-600 mb-2" />
                <CardTitle>Document Management</CardTitle>
                <CardDescription>
                  Organize your writing projects with intuitive document management. 
                  Auto-save keeps your work secure.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardHeader>
                <Zap className="w-10 h-10 text-orange-600 mb-2" />
                <CardTitle>Real-time Analysis</CardTitle>
                <CardDescription>
                  See suggestions and insights as you type. No need to wait - 
                  get feedback instantly while you&apos;re in the flow.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardHeader>
                <Target className="w-10 h-10 text-red-600 mb-2" />
                <CardTitle>Writing Metrics</CardTitle>
                <CardDescription>
                  Track word count, character limits, and writing statistics 
                  to help you meet your goals and constraints.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardHeader>
                <MessageSquare className="w-10 h-10 text-indigo-600 mb-2" />
                <CardTitle>Contextual Feedback</CardTitle>
                <CardDescription>
                  AI understands your writing context and provides relevant 
                  suggestions that improve clarity and impact.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              How AnimusWriter Works
            </h2>
            <p className="text-xl text-muted-foreground">
              Start writing better in three simple steps
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="font-bold text-blue-600 dark:text-blue-400">1</span>
              </div>
              <h3 className="font-semibold mb-2">Create Your Document</h3>
              <p className="text-muted-foreground">
                Start with a new document or import your existing writing. 
                Our clean interface lets you focus on your ideas.
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="font-bold text-green-600 dark:text-green-400">2</span>
              </div>
              <h3 className="font-semibold mb-2">Write & Get Insights</h3>
              <p className="text-muted-foreground">
                As you write, your Anima nurtures creativity while your Animus challenges growth. 
                Get real-time grammar suggestions, style improvements, and archetypal insights.
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="font-bold text-purple-600 dark:text-purple-400">3</span>
              </div>
              <h3 className="font-semibold mb-2">Improve & Polish</h3>
              <p className="text-muted-foreground">
                Accept suggestions with one click, get detailed explanations, 
                and watch your writing improve with every edit.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Ready to unlock your creative potential?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Join writers who are balancing their Anima & Animus to create authentic, powerful content
          </p>
          
          <Button asChild size="lg" variant="secondary" className="text-lg px-8 py-6">
            <Link href="/auth/sign-up">
              <PenTool className="w-5 h-5 mr-2" />
              Get Started Free
            </Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full flex items-center justify-center border-t mx-auto text-center text-xs gap-8 py-16">
        <p>
          Powered by{" "}
          <a
            href="https://supabase.com/?utm_source=create-next-app&utm_medium=template&utm_term=nextjs"
            target="_blank"
            className="font-bold hover:underline"
            rel="noreferrer"
          >
            Supabase
          </a>
        </p>
        <ThemeSwitcher />
      </footer>
    </main>
  );
}
