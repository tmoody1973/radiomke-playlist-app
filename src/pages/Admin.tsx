
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CustomEventsAdmin } from '@/components/admin/CustomEventsAdmin';
import { ManualSongsAdmin } from '@/components/admin/ManualSongsAdmin';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, LogOut } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export default function Admin() {
  const navigate = useNavigate();
  const { user, loading, isAdmin, signOut } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect via useEffect
  }

  if (!isAdmin()) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-2xl mx-auto mt-16">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Access Denied
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Alert>
                <AlertDescription>
                  You don't have administrator privileges to access this page.
                  Please contact an administrator to request access.
                </AlertDescription>
              </Alert>
              <div className="mt-4 flex gap-2">
                <Button onClick={() => navigate('/')} variant="outline">
                  Go Home
                </Button>
                <Button onClick={handleSignOut} variant="destructive">
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Playlist Admin</h1>
            <p className="text-muted-foreground">Manage custom events for both station playlists</p>
          </div>
          <Button onClick={handleSignOut} variant="outline" size="sm">
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </div>
        
        <Tabs defaultValue="events" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="events">Custom Events</TabsTrigger>
            <TabsTrigger value="songs">Manual Songs</TabsTrigger>
          </TabsList>
          <TabsContent value="events" className="mt-6">
            <CustomEventsAdmin />
          </TabsContent>
          <TabsContent value="songs" className="mt-6">
            <ManualSongsAdmin />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
