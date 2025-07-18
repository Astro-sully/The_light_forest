import { AddChannelForm } from "@/components/add-channel-form";
import { ChannelGrid } from "@/components/channel-grid";

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-border">
        <div className="max-w-6xl mx-auto px-6 py-6">
          <div className="text-center">
            <h1 className="text-3xl font-semibold mb-2">My Clean Internet</h1>
            <p className="text-muted-foreground">Your curated, distraction-free video sanctuary</p>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-12">
        <AddChannelForm />
        <ChannelGrid />
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-16">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="text-center">
            <p className="text-muted-foreground text-sm">Your personal, distraction-free video sanctuary</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
