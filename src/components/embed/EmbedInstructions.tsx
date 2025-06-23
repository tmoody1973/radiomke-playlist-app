
import { Card, CardContent } from '@/components/ui/card';

const EmbedInstructions = () => {
  return (
    <Card>
      <CardContent className="pt-6">
        <h3 className="text-lg font-semibold mb-2">Additional Resources</h3>
        <div className="text-sm text-muted-foreground space-y-2">
          <p>For technical support or advanced customization options, please refer to our documentation.</p>
          <p>If you need help with implementation, feel free to contact our support team.</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default EmbedInstructions;
