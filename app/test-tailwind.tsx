export default function TestTailwind() {
  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-primary mb-6">
        Tailwind CSS Test Page
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-card shadow-md rounded-lg p-6">
          <h2 className="text-xl font-semibold text-card-foreground mb-4">
            Card Example
          </h2>
          <p className="text-muted-foreground">
            This card uses Tailwind CSS utility classes for styling.
          </p>
          <button className="mt-4 bg-primary text-primary-foreground px-4 py-2 rounded hover:bg-primary/90 transition-colors">
            Primary Button
          </button>
        </div>

        <div className="bg-accent shadow-md rounded-lg p-6">
          <h2 className="text-xl font-semibold text-accent-foreground mb-4">
            Accent Card
          </h2>
          <p className="text-muted-foreground">
            Testing accent colors and other Tailwind utilities.
          </p>
          <button className="mt-4 bg-secondary text-secondary-foreground px-4 py-2 rounded hover:bg-secondary/90 transition-colors">
            Secondary Button
          </button>
        </div>
      </div>

      <div className="mt-8 p-6 border border-border rounded-lg">
        <h2 className="text-2xl font-bold mb-4">Typography & Spacing</h2>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">Small muted text</p>
          <p className="text-base">Base size text</p>
          <p className="text-lg font-medium">Larger medium text</p>
          <p className="text-xl font-semibold">Extra large semibold text</p>
          <div className="flex space-x-4 items-center">
            <div className="w-8 h-8 bg-primary rounded-full"></div>
            <div className="w-10 h-10 bg-secondary rounded-full"></div>
            <div className="w-12 h-12 bg-destructive rounded-full"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
