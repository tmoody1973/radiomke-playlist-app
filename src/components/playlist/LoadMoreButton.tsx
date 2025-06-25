
import { Button } from '@/components/ui/button';
import { Heart } from 'lucide-react';

interface LoadMoreButtonProps {
  hasMoreSpins: boolean;
  loadingMore: boolean;
  onLoadMore: () => void;
}

export const LoadMoreButton = ({ hasMoreSpins, loadingMore, onLoadMore }: LoadMoreButtonProps) => {
  return (
    <>
      {hasMoreSpins && (
        <div className="mt-4 flex justify-center">
          <Button
            variant="outline"
            onClick={onLoadMore}
            disabled={loadingMore}
            className="w-full sm:w-auto"
          >
            {loadingMore ? 'Loading...' : 'Load More'}
          </Button>
        </div>
      )}
      
      {/* Footer */}
      <div className="mt-8 text-center text-sm text-muted-foreground border-t pt-4">
        <p className="flex items-center justify-center gap-1">
          Made with <Heart className="h-4 w-4 text-red-500 fill-current" /> by Tarik aka the Architect
        </p>
      </div>
    </>
  );
};
