
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
      </CardContent>
    </Card>
  );
};

export default EmbedInstructions;
