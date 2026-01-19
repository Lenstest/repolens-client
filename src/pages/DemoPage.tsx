import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect } from 'react';
import { GitBranch, Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { api } from '@/lib/api';
import { useQuery } from '@tanstack/react-query';

interface DemoRepository {
  id: string;
  name: string;
  description: string;
  language: string;
  files_count: number;
}

export default function DemoPage() {
  const navigate = useNavigate();
  const { isDemoMode, enterDemoMode } = useAuth();

  useEffect(() => {
    if (!isDemoMode) {
      enterDemoMode();
    }
  }, [isDemoMode, enterDemoMode]);

  // Fetch demo repositories from backend
  const { data: demoRepositories = [], isLoading } = useQuery({
    queryKey: ['demo-repos'],
    queryFn: () => api.get<DemoRepository[]>('/api/demo/repositories'),
  });

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container py-12">
        <div className="max-w-2xl mx-auto text-center mb-12">
          <h1 className="text-3xl font-bold mb-4">Explore Demo Repositories</h1>
          <p className="text-muted-foreground">
            Try RepoLens with pre-analyzed open source projects. No login required.
          </p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {demoRepositories.map((repo) => (
              <Card
                key={repo.id}
                className="cursor-pointer transition-all hover:bg-muted/30 hover:shadow-lg"
                onClick={() => navigate(`/graph/${repo.id}`)}
              >
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3 mb-4">
                    <GitBranch className="h-6 w-6 text-primary" />
                    <div>
                      <h3 className="font-semibold">{repo.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {repo.files_count} files • {repo.language}
                      </p>
                    </div>
                  </div>

                  <p className="text-sm text-muted-foreground">
                    {repo.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
