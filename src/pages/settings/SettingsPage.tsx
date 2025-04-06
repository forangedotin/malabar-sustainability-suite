
import React from 'react';
import { Link } from 'react-router-dom';
import Layout from '@/components/Layout';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DollarSign, Users, Settings } from 'lucide-react';
import { useAuth } from '@/contexts/auth';

const SettingsPage = () => {
  const { isAdmin } = useAuth();

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">
            Configure system settings and preferences
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {isAdmin && (
            <>
              <Card>
                <CardHeader className="space-y-1">
                  <CardTitle className="flex items-center">
                    <DollarSign className="mr-2 h-5 w-5" />
                    Rate Management
                  </CardTitle>
                  <CardDescription>
                    Configure and update rates for materials, labor, and other operations
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Set rates for material purchases, sales, labor charges, and commissions. 
                    Changes will apply to future transactions while preserving historical data.
                  </p>
                </CardContent>
                <CardFooter>
                  <Link to="/settings/rates" className="w-full">
                    <Button className="w-full">Manage Rates</Button>
                  </Link>
                </CardFooter>
              </Card>

              <Card>
                <CardHeader className="space-y-1">
                  <CardTitle className="flex items-center">
                    <Users className="mr-2 h-5 w-5" />
                    User Management
                  </CardTitle>
                  <CardDescription>
                    Manage users and their permissions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Add, edit, or remove user accounts. Control access permissions
                    and role assignments for the system.
                  </p>
                </CardContent>
                <CardFooter>
                  <Link to="/managers" className="w-full">
                    <Button className="w-full">Manage Users</Button>
                  </Link>
                </CardFooter>
              </Card>
            </>
          )}

          <Card>
            <CardHeader className="space-y-1">
              <CardTitle className="flex items-center">
                <Settings className="mr-2 h-5 w-5" />
                System Preferences
              </CardTitle>
              <CardDescription>
                Configure general system settings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Update notification settings, display preferences, and other general system options.
              </p>
            </CardContent>
            <CardFooter>
              <Button className="w-full" disabled>Coming Soon</Button>
            </CardFooter>
          </Card>
        </div>

        {!isAdmin && (
          <Card>
            <CardHeader>
              <CardTitle>Limited Access</CardTitle>
              <CardDescription>
                Some settings are restricted to administrators only
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Please contact an administrator if you need to access restricted settings or make changes to system configuration.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
};

export default SettingsPage;
