
import React from 'react';
import { Button } from '@/components/ui/button';
import { Bell, Moon, Settings, Sun } from 'lucide-react';
import { useTheme } from '@/components/theme/ThemeProvider';
import { Toggle } from '@/components/ui/toggle';

const Header = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="bg-primary shadow-sm border-b border-border/40 py-2 px-6 animate-fade-in">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-semibold text-primary-foreground">PCPartner Operations</h1>
          <Toggle 
            pressed={theme === 'dark'} 
            onPressedChange={toggleTheme}
            aria-label="Toggle dark mode"
            className="h-7 w-7 rounded-full hover:bg-background/80 transition-colors"
          >
            {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Toggle>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="rounded-full h-7 w-7 hover:bg-primary/10 text-primary-foreground">
            <Bell className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="rounded-full h-7 w-7 hover:bg-primary/10 text-primary-foreground">
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
