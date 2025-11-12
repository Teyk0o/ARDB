import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Arc Raiders Item Categories - Browse by Type',
  description: 'Browse Arc Raiders items by category: weapons, materials, shields, and more. Find crafting guides and item information.',
  robots: {
    index: true,
    follow: true,
  },
};

export default function CategoriesPage() {
  const categories = [
    {
      name: 'Weapons',
      description: 'All combat weapons including rifles, pistols, shotguns, and specialized firearms',
      types: ['Weapon']
    },
    {
      name: 'Materials',
      description: 'Crafting materials including basic materials, refined materials, and advanced materials',
      types: ['Basic Material', 'Refined Material', 'Advanced Material', 'Topside Material']
    },
    {
      name: 'Medical & Consumables',
      description: 'Medical supplies, health items, stamina restoration, and consumable gadgets',
      types: ['Medical', 'Quick Use', 'Quick use', 'Consumable']
    },
    {
      name: 'Shields & Protection',
      description: 'Protective gear, shields, and defense augmentations',
      types: ['Shield', 'Augment']
    },
    {
      name: 'Ammunition',
      description: 'All ammunition types for various weapons',
      types: ['Ammunition']
    },
    {
      name: 'Explosives & Gadgets',
      description: 'Throwable explosives, utility gadgets, and special tools',
      types: ['Explosives', 'Gadget', 'Throwable']
    },
    {
      name: 'Keys & Special Items',
      description: 'Quest items, keys, and special collectibles',
      types: ['Key', 'Quest Item', 'Misc']
    },
    {
      name: 'Cosmetics & Modifications',
      description: 'Visual customization, weapon mods, and cosmetic items',
      types: ['Cosmetic', 'Modification', 'Mods']
    }
  ];

  return (
    <div className="min-h-screen bg-arc-blue">
      {/* Header */}
      <header className="bg-arc-blue-light border-b-2 border-arc-yellow/30 grain-texture">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl md:text-4xl font-bold text-arc-white mb-2">
            Item Categories
          </h1>
          <p className="text-arc-white/70">
            Browse items by category to find what you need for your next mission
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category) => {
            const filterQuery = category.types.length === 1
              ? `?type=${encodeURIComponent(category.types[0])}`
              : `?types=${encodeURIComponent(category.types.join(','))}`;

            return (
            <a
              key={category.name}
              href={`/${filterQuery}`}
              className="group bg-arc-blue-light border-2 border-arc-blue-lighter hover:border-arc-yellow rounded-lg p-6 transition-all duration-300 hover:shadow-lg"
            >
              <h2 className="text-xl font-bold text-arc-white mb-2 group-hover:text-arc-yellow transition-colors">
                {category.name}
              </h2>
              <p className="text-arc-white/70 text-sm mb-4">
                {category.description}
              </p>
              <div className="text-arc-yellow text-sm font-semibold">
                Explore Items
              </div>
            </a>
            );
          })}
        </div>

        {/* Crafting Tips Section */}
        <section className="mt-16">
          <h2 className="text-2xl font-bold text-arc-white mb-6">Getting Started</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-arc-blue-light border-2 border-arc-yellow/30 rounded-lg p-6">
              <h3 className="text-lg font-bold text-arc-yellow mb-3">Basics</h3>
              <ul className="text-arc-white/70 space-y-2 text-sm">
                <li>• Collect basic materials from loot areas</li>
                <li>• Visit workbenches to craft items</li>
                <li>• Check the database for crafting recipes</li>
                <li>• Recycle unwanted items for materials</li>
              </ul>
            </div>
            <div className="bg-arc-blue-light border-2 border-arc-yellow/30 rounded-lg p-6">
              <h3 className="text-lg font-bold text-arc-yellow mb-3">Tips</h3>
              <ul className="text-arc-white/70 space-y-2 text-sm">
                <li>• Recycle rare items for valuable materials</li>
                <li>• Prioritize weapon crafting for better combat</li>
                <li>• Use medical items strategically in missions</li>
                <li>• Gather materials between missions</li>
              </ul>
            </div>
          </div>
        </section>
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
