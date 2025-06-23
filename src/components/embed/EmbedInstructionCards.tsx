
import { Card, CardContent } from '@/components/ui/card';

const EmbedInstructionCards = () => {
  return (
    <div className="grid md:grid-cols-2 gap-6 mb-8">
      <Card>
        <CardContent className="pt-6">
          <h3 className="text-lg font-semibold mb-2">How to Use</h3>
          <div className="text-sm text-muted-foreground space-y-2">
            <p><strong>SEO-Enhanced iFrame:</strong> Includes structured data, fallback content, and contextual information</p>
            <p>1. Select your preferred radio station from the available options</p>
            <p>2. Customize the settings below to match your needs</p>
            <p>3. Copy the generated SEO-friendly embed code</p>
            <p>4. Follow the SEO recommendations below for best results</p>
            <p><strong>Search Engine Benefits:</strong> Better indexing, rich snippets, and improved page relevance</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <h3 className="text-lg font-semibold mb-2">📏 Height Recommendations</h3>
          <div className="text-sm text-muted-foreground space-y-2">
            <p><strong>600px:</strong> Shows 7-8 songs (compact, good for sidebars)</p>
            <p><strong>700px:</strong> Shows 9-10 songs (balanced height)</p>
            <p><strong>800px:</strong> Shows 11-13 songs (recommended for main content)</p>
            <p><strong>1200px:</strong> Shows all 15 songs without scrolling (very tall)</p>
            <p className="text-sm mt-3 text-blue-600 dark:text-blue-400">💡 Most websites work best with 700-800px height</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmbedInstructionCards;
