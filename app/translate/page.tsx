import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Help Translate Arc Raiders Database',
  description: 'Help translate the Arc Raiders Database into French and other languages on Crowdin.',
  robots: {
    index: true,
    follow: true,
  },
};

export default function TranslatePage() {
  return (
    <div className="min-h-screen bg-arc-blue">
      {/* Header */}
      <header className="bg-arc-blue-light border-b-2 border-arc-yellow/30 grain-texture">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl md:text-4xl font-bold text-arc-white mb-2">
            Help Translate
          </h1>
          <p className="text-arc-white/70">
            Support the Arc Raiders Database by translating into your language
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          {/* Info Section */}
          <section className="bg-arc-blue-light border-2 border-arc-yellow/30 rounded-lg p-8 mb-8">
            <h2 className="text-2xl font-bold text-arc-white mb-4">Join Our Translation Team</h2>
            <p className="text-arc-white/80 mb-6">
              The Arc Raiders Database is maintained by the community. We're looking for translators to help make the database available in multiple languages.
            </p>
            <p className="text-arc-white/80 mb-6">
              Currently supported languages:
            </p>
            <ul className="text-arc-white/70 space-y-2 mb-8">
              <li>English (Complete)</li>
              <li>Français (In Progress)</li>
            </ul>

            <a
              href="https://crowdin.com/project/ardb"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-arc-yellow hover:bg-arc-yellow/80 text-arc-blue font-bold py-3 px-6 rounded-lg transition-colors"
            >
              Contribute on Crowdin
            </a>
          </section>

          {/* How It Works */}
          <section className="bg-arc-blue-light border-2 border-arc-blue-lighter rounded-lg p-8 mb-8">
            <h2 className="text-2xl font-bold text-arc-white mb-6">How to Contribute</h2>
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold text-arc-yellow mb-2">1. Create a Crowdin Account</h3>
                <p className="text-arc-white/70">
                  Visit Crowdin and create a free account if you don't have one already.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-bold text-arc-yellow mb-2">2. Join the Project</h3>
                <p className="text-arc-white/70">
                  Find the Arc Raiders Database project on Crowdin and request to join.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-bold text-arc-yellow mb-2">3. Start Translating</h3>
                <p className="text-arc-white/70">
                  Select a language and start translating item names and descriptions.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-bold text-arc-yellow mb-2">4. Get Recognition</h3>
                <p className="text-arc-white/70">
                  Major contributors will be credited on this page and in the database.
                </p>
              </div>
            </div>
          </section>

          {/* What Needs Translation */}
          <section className="bg-arc-blue-light border-2 border-arc-blue-lighter rounded-lg p-8 mb-8">
            <h2 className="text-2xl font-bold text-arc-white mb-4">What Needs Translation</h2>
            <p className="text-arc-white/70 mb-6">
              We need translations for:
            </p>
            <ul className="text-arc-white/70 space-y-3">
              <li>Item names (485 items)</li>
              <li>Item descriptions</li>
              <li>UI text (buttons, labels, etc.)</li>
              <li>Game guides and tips</li>
            </ul>
          </section>

          {/* Credits */}
          <section className="bg-arc-blue-light border-2 border-arc-blue-lighter rounded-lg p-8">
            <h2 className="text-2xl font-bold text-arc-white mb-6">Translators</h2>
            <p className="text-arc-white/70 mb-4">
              Thanks to all contributors helping translate Arc Raiders Database:
            </p>
            <div className="text-arc-white/60 italic">
              Coming soon - contribute to be listed here!
            </div>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-arc-blue-lighter mt-12 py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-arc-white/70 text-sm">
            <a href="/" className="text-arc-yellow hover:underline">
              Back to Database
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
