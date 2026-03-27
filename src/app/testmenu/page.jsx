// components/Menu.jsx
import React from 'react';

const Menu = () => {
  const menuData = {
    lunch: {
      hotChips: {
        name: "HOT CHIPS",
        description: "w/ tomato sauce",
        price: 12
      },
      bruschetta: {
        name: "BRUSCHETTA",
        description: "Garlic toasted bread, 12 hours roasted tomato, basil pesto, feta & balsamic",
        price: 20,
        additions: [
          { name: "+ bacon", price: 7 },
          { name: "+ chorizo", price: 6 }
        ]
      },
      crumbChicken: {
        name: "CRUMB CHICKEN",
        description: "Panko crumb chicken w/ chilli mayo, bacon, tomato, lettuce & chips on soft brioche bun",
        price: 26
      },
      lambSalad: {
        name: "LAMB SALAD",
        description: "Slow cooked lamb, salad mix, kipfler potato, red onion, mint, cherry tomato, feta, chickpeas and harissa dressing",
        price: 26,
        dietary: ['gfo', 'dfo', 'nfs']
      },
      toastedPita: {
        name: "TOASTED PITA",
        price: 19,
        options: [
          {
            name: "SLOW COOKED LAMB",
            description: "Caramelised onion, tomato relish, béchamel sauce, mozzarella and spinach",
            addPrice: 7,
            includes: "A small green salad or chips"
          },
          {
            name: "ROASTED PUMPKIN",
            description: "Basil pesto, roasted red peppers, caramelised onion, feta and wild rocket",
            addPrice: 7,
            includes: "A small green salad or chips"
          },
          {
            name: "AGED PROSCIUTTO",
            description: "Fresh tomato, Swiss cheese, mayo and wild rocket",
            addPrice: 7,
            includes: "A small green salad or chips"
          },
          {
            name: "POACHED CHICKEN",
            description: "Mayo, lettuce, chives, swiss cheese",
            addPrice: 7,
            includes: "A small green salad or chips"
          }
        ]
      }
    },
    kids: [
      { name: "Poached Egg / Scramble / Fried on Toast", price: 7 },
      { name: "French Toast w/ Maple Syrup, Strawberry & Ice Cream", price: 10 },
      { name: "Grilled Cheese on Toast", price: 8.5 }
    ],
    sandwiches: [
      { name: "H/C/T Croissants", price: 12 },
      { name: "H/C/T Toasties", price: 12 },
      { name: "Egg & Bacon Toasties", price: 13 }
    ],
    drinks: {
      soft: [
        { name: "Coke", price: 4.5 },
        { name: "Still Water", price: 4 }
      ],
      fiji: {
        title: "Fiji Drinks 250ml",
        price: 5.5,
        flavors: ["Sparkling Water", "Blood Orange", "Grape Fruit", "Lemonade"]
      },
      sparkling: { name: "Sparkling Water 750ml", price: 10 },
      kombucha: { name: "Kombucha", price: 7 },
      juice: {
        name: "Pressed Juice",
        price: 7,
        flavors: ["Apple", "Orange", "Green", "Beetroot"]
      }
    },
    sides: {
      items: [
        { name: "Smoke Salmon / Prosciutto", price: 7.5 },
        { name: "Double Smoke Bacon", price: 7 },
        { name: "Half Avocado / Hash Brown / Chorizo / Halloumi", price: 6 },
        { name: "12 hrs Roasted Tomato / Thyme Mustard Mushroom / Wilted Spinach / Feta", price: 4.5 },
        { name: "1 Poached Egg / Tomato Relish / Mayonnaise / GF Bread", price: 3 },
        { name: "Dukkha / Chilli Flakes / 1 Piece of Bread / Mayo / Relish", price: 2 }
      ]
    }
  };

  const DietaryBadge = ({ type }) => {
    const badges = {
      gfo: { label: "GF", color: "bg-green-100 text-green-800", title: "Gluten Free Option" },
      dfo: { label: "DF", color: "bg-blue-100 text-blue-800", title: "Dairy Free Option" },
      nfs: { label: "NF", color: "bg-purple-100 text-purple-800", title: "Nut Free" },
      vo: { label: "V", color: "bg-emerald-100 text-emerald-800", title: "Vegan Option" },
      cn: { label: "⚠️", color: "bg-red-100 text-red-800", title: "Contains Nuts" }
    };
    
    const badge = badges[type] || { label: type, color: "bg-gray-100 text-gray-800" };
    
    return (
      <span 
        className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${badge.color}`}
        title={badge.title}
      >
        {badge.label}
      </span>
    );
  };

  return (
    <div className="bg-white pt-8 relative overflow-hidden">
      <section className="relative max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Centered faint background image */}
        <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 p-4 pointer-events-none z-0">
          <img
            src="/mainimage/main-image.webp"
            alt=""
            width={400}
            height={400}
            className="opacity-[0.07] object-contain mix-blend-multiply"
          />
        </div>

        <div className="relative z-10 w-full max-w-4xl mx-auto min-h-screen">
          {/* Header */}
          <div className="text-center mb-8 sm:mb-10 pb-6 border-b border-gray-100">
            <h1 
              className="text-3xl sm:text-4xl font-semibold text-gray-800 mb-2 tracking-wide"
              style={{ fontFamily: 'playfairbold' }}
            >
              Menu
            </h1>
            <p 
              className="text-sm text-gray-500 uppercase tracking-widest"
              style={{ fontFamily: 'arial' }}
            >
              Serving Lunch
            </p>
          </div>

          {/* Lunch Section */}
          <section className="mb-10 sm:mb-12">
            <h2 
              className="text-xl sm:text-2xl font-semibold mb-6 pb-2 border-b border-gray-300 text-gray-800 tracking-wider uppercase"
              style={{ fontFamily: 'playfairbold' }}
            >
              Lunch
            </h2>
            
            {/* Hot Chips */}
            <div className="mb-6 group">
              <div className="flex justify-between items-baseline mb-1">
                <span className="text-base sm:text-lg font-semibold text-gray-800 uppercase" style={{ fontFamily: 'arial' }}>{menuData.lunch.hotChips.name}</span>
                <span className="text-base sm:text-lg text-gray-700 font-medium" style={{ fontFamily: 'arial' }}>${menuData.lunch.hotChips.price}</span>
              </div>
              <p className="text-gray-500 text-sm italic" style={{ fontFamily: 'arial' }}>{menuData.lunch.hotChips.description}</p>
            </div>

            {/* Bruschetta */}
            <div className="mb-6 group">
              <div className="flex justify-between items-baseline mb-1">
                <span className="text-base sm:text-lg font-semibold text-gray-800 uppercase" style={{ fontFamily: 'arial' }}>{menuData.lunch.bruschetta.name}</span>
                <span className="text-base sm:text-lg text-gray-700 font-medium" style={{ fontFamily: 'arial' }}>${menuData.lunch.bruschetta.price}</span>
              </div>
              <p className="text-gray-500 text-sm italic mb-2" style={{ fontFamily: 'arial' }}>{menuData.lunch.bruschetta.description}</p>
              <div className="flex flex-wrap gap-2">
                {menuData.lunch.bruschetta.additions.map((add, idx) => (
                  <span key={idx} className="inline-flex items-center px-2 py-0.5 text-xs text-gray-600 border border-gray-200 rounded-sm">
                    {add.name} <span className="ml-1 text-gray-400 font-medium">+${add.price}</span>
                  </span>
                ))}
              </div>
            </div>

            {/* Crumb Chicken */}
            <div className="mb-6 group">
              <div className="flex justify-between items-baseline mb-1">
                <span className="text-base sm:text-lg font-semibold text-gray-800 uppercase" style={{ fontFamily: 'arial' }}>{menuData.lunch.crumbChicken.name}</span>
                <span className="text-base sm:text-lg text-gray-700 font-medium" style={{ fontFamily: 'arial' }}>${menuData.lunch.crumbChicken.price}</span>
              </div>
              <p className="text-gray-500 text-sm italic" style={{ fontFamily: 'arial' }}>{menuData.lunch.crumbChicken.description}</p>
            </div>

            {/* Lamb Salad with dietary badges */}
            <div className="mb-6 group">
              <div className="flex justify-between items-baseline mb-1">
                <span className="text-base sm:text-lg font-semibold text-gray-800 uppercase" style={{ fontFamily: 'arial' }}>{menuData.lunch.lambSalad.name}</span>
                <span className="text-base sm:text-lg text-gray-700 font-medium" style={{ fontFamily: 'arial' }}>${menuData.lunch.lambSalad.price}</span>
              </div>
              <p className="text-gray-500 text-sm italic mb-2" style={{ fontFamily: 'arial' }}>{menuData.lunch.lambSalad.description}</p>
              <div className="flex gap-1.5">
                {menuData.lunch.lambSalad.dietary.map((diet) => (
                  <DietaryBadge key={diet} type={diet} />
                ))}
              </div>
            </div>

            {/* Toasted Pita Options */}
            <div className="mb-6 group">
              <div className="flex justify-between items-baseline mb-3">
                <span className="text-base sm:text-lg font-semibold text-gray-800 uppercase" style={{ fontFamily: 'arial' }}>{menuData.lunch.toastedPita.name}</span>
                <span className="text-base sm:text-lg text-gray-700 font-medium" style={{ fontFamily: 'arial' }}>${menuData.lunch.toastedPita.price}</span>
              </div>
              <div className="ml-2 sm:ml-4 pl-3 border-l-[1.5px] border-gray-200 space-y-4">
                {menuData.lunch.toastedPita.options.map((option, idx) => (
                  <div key={idx} className="group/item">
                    <div className="flex justify-between items-baseline mb-0.5">
                      <span className="text-gray-800 font-medium uppercase text-sm" style={{ fontFamily: 'arial' }}>{option.name}</span>
                      <span className="text-gray-600 text-sm font-medium">+${option.addPrice}</span>
                    </div>
                    <p className="text-gray-500 italic text-sm mb-0.5" style={{ fontFamily: 'arial' }}>{option.description}</p>
                    <p className="text-gray-400 text-[11px] uppercase tracking-wide" style={{ fontFamily: 'arial' }}>Includes: {option.includes}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Kids Menu */}
          <section className="mb-10 sm:mb-12">
            <h2 
              className="text-xl sm:text-2xl font-semibold mb-6 pb-2 border-b border-gray-300 text-gray-800 tracking-wider uppercase"
              style={{ fontFamily: 'playfairbold' }}
            >
              Kids Only
            </h2>
            <div className="space-y-3" style={{ fontFamily: 'arial' }}>
              {menuData.kids.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center group">
                  <span className="text-gray-700 text-sm sm:text-base">{item.name}</span>
                  <span className="text-gray-700 font-medium text-sm sm:text-base">${item.price}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Sandwiches */}
          <section className="mb-10 sm:mb-12">
            <h2 
              className="text-xl sm:text-2xl font-semibold mb-6 pb-2 border-b border-gray-300 text-gray-800 tracking-wider uppercase"
              style={{ fontFamily: 'playfairbold' }}
            >
              Sandwiches
            </h2>
            <div className="space-y-3" style={{ fontFamily: 'arial' }}>
              {menuData.sandwiches.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center group">
                  <span className="text-gray-700 text-sm sm:text-base">{item.name}</span>
                  <span className="text-gray-700 font-medium text-sm sm:text-base">${item.price}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Beverages */}
          <section className="mb-10 sm:mb-12">
            <h2 
              className="text-xl sm:text-2xl font-semibold mb-6 pb-2 border-b border-gray-300 text-gray-800 tracking-wider uppercase"
              style={{ fontFamily: 'playfairbold' }}
            >
              Beverages
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6" style={{ fontFamily: 'arial' }}>
              {/* Soft Drinks */}
              <div className="space-y-3">
                {menuData.drinks.soft.map((drink, idx) => (
                  <div key={idx} className="flex justify-between items-center">
                    <span className="text-gray-700 text-sm sm:text-base">{drink.name}</span>
                    <span className="text-gray-700 font-medium text-sm sm:text-base">${drink.price}</span>
                  </div>
                ))}

                <div className="pt-1">
                  <div className="flex justify-between items-center mb-0.5">
                    <span className="text-gray-700 text-sm sm:text-base">{menuData.drinks.fiji.title}</span>
                    <span className="text-gray-700 font-medium text-sm sm:text-base">${menuData.drinks.fiji.price}</span>
                  </div>
                  <p className="text-xs text-gray-400 italic">{menuData.drinks.fiji.flavors.join(' • ')}</p>
                </div>
              </div>

              {/* Sparkling & Juice */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-700 text-sm sm:text-base">{menuData.drinks.sparkling.name}</span>
                  <span className="text-gray-700 font-medium text-sm sm:text-base">${menuData.drinks.sparkling.price}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-gray-700 text-sm sm:text-base">{menuData.drinks.kombucha.name}</span>
                  <span className="text-gray-700 font-medium text-sm sm:text-base">${menuData.drinks.kombucha.price}</span>
                </div>

                <div className="pt-1">
                  <div className="flex justify-between items-center mb-0.5">
                    <span className="text-gray-700 text-sm sm:text-base">{menuData.drinks.juice.name}</span>
                    <span className="text-gray-700 font-medium text-sm sm:text-base">${menuData.drinks.juice.price}</span>
                  </div>
                  <p className="text-xs text-gray-400 italic">{menuData.drinks.juice.flavors.join(' • ')}</p>
                </div>
              </div>
            </div>
          </section>

          {/* Sides */}
          <section className="mb-10 sm:mb-12">
            <h2 
              className="text-xl sm:text-2xl font-semibold mb-6 pb-2 border-b border-gray-300 text-gray-800 tracking-wider uppercase"
              style={{ fontFamily: 'playfairbold' }}
            >
              Sides & Add-Ons
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3" style={{ fontFamily: 'arial' }}>
              {menuData.sides.items.map((item, idx) => (
                <div key={idx} className="flex justify-between items-start pt-2 border-t border-gray-100 first:border-t-0 md:first:border-t first:pt-0 md:[&:nth-child(2)]:border-t-0 md:[&:nth-child(2)]:pt-0 md:first:pt-0">
                  <span className="text-gray-700 text-sm pr-4">{item.name}</span>
                  <span className="text-gray-700 font-medium text-sm whitespace-nowrap">${item.price}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Dietary Key */}
          <div className="mb-10 pt-6 border-t border-gray-200">
            <h3 className="text-xs font-semibold mb-3 text-gray-400 uppercase tracking-widest text-center" style={{ fontFamily: 'arial' }}>Dietary Information</h3>
            <div className="flex flex-wrap justify-center gap-x-6 gap-y-2">
              <span className="text-xs text-gray-500 uppercase tracking-wide" style={{ fontFamily: 'arial' }}>GFO - Gluten Free Option</span>
              <span className="text-xs text-gray-500 uppercase tracking-wide" style={{ fontFamily: 'arial' }}>DFO - Dairy Free Option</span>
              <span className="text-xs text-gray-500 uppercase tracking-wide" style={{ fontFamily: 'arial' }}>VO - Vegan Option</span>
              <span className="text-xs text-gray-500 uppercase tracking-wide" style={{ fontFamily: 'arial' }}>⚠️ - Contains Nuts</span>
            </div>
          </div>

          {/* Footer Information */}
          <div className="mt-10 pt-8 border-t border-gray-200 text-center space-y-3" style={{ fontFamily: 'arial' }}>
            <p className="text-gray-700 font-medium text-xs sm:text-sm uppercase tracking-wider">15% surcharge applies on public holidays</p>
            <p className="text-gray-700 font-medium text-xs sm:text-sm uppercase tracking-wider">Sorry, no changes to the menu on weekends</p>
            
            <div className="mt-8 mx-auto max-w-xl px-4 py-5 border border-gray-200 bg-[#fafafa]">
              <p className="text-gray-800 font-semibold mb-1 uppercase tracking-wide text-xs">IMPORTANT ALLERGY INFORMATION</p>
              <p className="text-gray-600 mb-2 text-xs italic">
                If you have any food allergy or special diet requirement, please inform our friendly staff.
              </p>
              <p className="text-[11px] text-gray-500 leading-relaxed max-w-md mx-auto">
                Menu items can be made nut-free, dairy free and gluten free on request but please be advised 
                that all food is prepared in a kitchen where gluten, nuts, seeds or any other known allergens 
                may be present. We take caution to prevent any contamination, however products may contain traces.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Menu;