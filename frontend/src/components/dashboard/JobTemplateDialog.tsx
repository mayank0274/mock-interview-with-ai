import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { JOB_TEMPLATES } from '@/constants/jobTemplates';
import { Briefcase, Code, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface JobTemplateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (template: (typeof JOB_TEMPLATES)[0]) => void;
}

export default function JobTemplateDialog({
  open,
  onOpenChange,
  onSelect,
}: JobTemplateDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-5xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-primary" />
            Choose a Job Template
          </DialogTitle>
          <p className="text-muted-foreground text-sm">
            Choose a preset to quickly set up your interview details.
          </p>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
          {JOB_TEMPLATES.map((template) => (
            <Card
              key={template.id}
              className="cursor-pointer hover:bg-muted/30 transition-all duration-300 border-dashed hover:border-solid hover:border-primary/50 group relative overflow-hidden hover:shadow-lg"
              onClick={() => {
                onSelect(template);
                onOpenChange(false);
              }}
            >
              <div
                className={cn(
                  'absolute top-0 left-0 w-full h-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300',
                  template.type === 'behavioral'
                    ? 'bg-secondary'
                    : 'bg-primary',
                )}
              />

              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg group-hover:text-primary transition-colors">
                  {template.id === 'generic' ? (
                    <Briefcase className="w-5 h-5 text-muted-foreground" />
                  ) : (
                    <Code className="w-5 h-5 text-primary" />
                  )}
                  {template.title}
                </CardTitle>
                <CardDescription className="line-clamp-2">
                  {template.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full text-muted-foreground group-hover:text-primary group-hover:bg-primary/5 transition-colors"
                >
                  Use this template
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
