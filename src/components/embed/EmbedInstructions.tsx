
import { Card, CardContent } from '@/components/ui/card';

const EmbedInstructions = () => {
  return (
    <Card>
      <CardContent className="pt-6">
        <h3 className="text-lg font-semibold mb-2">How to Use</h3>
        <div className="text-sm text-muted-foreground space-y-2">
          <p><strong>iFrame Method:</strong> Auto-resizing iframe that adjusts height when content changes</p>
          <p><strong>JavaScript Method:</strong> Better for SEO and customization - content is rendered directly on your page</p>
          <p>1. Select your preferred radio station from the available options</p>
          <p>2. Customize the settings above to match your needs</p>
          <p>3. Choose between iFrame or JavaScript embed method</p>
          <p>4. Copy the generated embed code and paste it into your website's HTML</p>
          <p>5. The widget will automatically update with live playlist data</p>
          <p><strong>Auto-resize:</strong> The iframe will automatically expand when users click "Load More"</p>
        </div>
        
        <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">📏 Height Recommendations</h4>
          <div className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
            <p><strong>600px:</strong> Shows 7-8 songs (compact, good for sidebars)</p>
            <p><strong>700px:</strong> Shows 9-10 songs (balanced height)</p>
            <p><strong>800px:</strong> Shows 11-13 songs (recommended for main content)</p>
            <p><strong>1200px:</strong> Shows all 15 songs without scrolling (very tall)</p>
            <p className="text-xs mt-2 opacity-80">💡 Most websites work best with 700-800px height</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default EmbedInstructions;
