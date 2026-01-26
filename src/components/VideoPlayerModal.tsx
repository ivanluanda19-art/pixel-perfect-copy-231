import { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Play, Clock, Gift, CheckCircle, Loader2 } from 'lucide-react';

interface Task {
  id: string;
  title: string;
  channel_name: string;
  video_id: string;
  duration_seconds: number;
  reward_amount: number;
}

interface VideoPlayerModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: Task | null;
  onComplete: () => void;
}

const VideoPlayerModal = ({ isOpen, onClose, task, onComplete }: VideoPlayerModalProps) => {
  const [watchedSeconds, setWatchedSeconds] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isOpen && task) {
      setWatchedSeconds(0);
      setIsCompleted(false);
      
      // Start timer when modal opens
      timerRef.current = setInterval(() => {
        setWatchedSeconds((prev) => {
          const next = prev + 1;
          if (next >= task.duration_seconds) {
            if (timerRef.current) clearInterval(timerRef.current);
            setIsCompleted(true);
          }
          return next;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isOpen, task]);

  const handleClose = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setWatchedSeconds(0);
    setIsCompleted(false);
    onClose();
  };

  const handleClaimReward = async () => {
    setIsSubmitting(true);
    await onComplete();
    setIsSubmitting(false);
  };

  if (!task) return null;

  const progress = Math.min((watchedSeconds / task.duration_seconds) * 100, 100);
  const remainingTime = Math.max(task.duration_seconds - watchedSeconds, 0);
  const minutes = Math.floor(remainingTime / 60);
  const seconds = remainingTime % 60;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="glass border-border/50 max-w-4xl p-0 overflow-hidden">
        <DialogHeader className="p-4 pb-0">
          <DialogTitle className="flex items-center gap-2">
            <Play className="h-5 w-5 text-primary" />
            {task.title}
          </DialogTitle>
        </DialogHeader>

        <div className="p-4 space-y-4">
          {/* Video Player */}
          <div className="aspect-video bg-black rounded-lg overflow-hidden relative">
            <iframe
              src={`https://www.youtube.com/embed/${task.video_id}?autoplay=1&rel=0`}
              title={task.title}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>

          {/* Progress Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>
                  {isCompleted ? (
                    <span className="text-green-500 flex items-center gap-1">
                      <CheckCircle className="h-4 w-4" />
                      Vídeo completo!
                    </span>
                  ) : (
                    `Tempo restante: ${minutes}:${seconds.toString().padStart(2, '0')}`
                  )}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Gift className="h-4 w-4 text-primary" />
                <span className="font-semibold text-primary">
                  Kz {task.reward_amount.toFixed(2)}
                </span>
              </div>
            </div>

            <Progress value={progress} className="h-2" />

            <p className="text-xs text-muted-foreground text-center">
              {isCompleted 
                ? 'Você pode resgatar sua recompensa agora!' 
                : 'Assista o vídeo até o final para receber sua recompensa'}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button variant="outline" onClick={handleClose} className="flex-1">
              Cancelar
            </Button>
            <Button
              variant="hero"
              onClick={handleClaimReward}
              disabled={!isCompleted || isSubmitting}
              className="flex-1"
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : isCompleted ? (
                <>
                  <Gift className="h-4 w-4" />
                  Resgatar Kz {task.reward_amount.toFixed(2)}
                </>
              ) : (
                'Aguardando...'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default VideoPlayerModal;
