"use client"
import React, { useState } from 'react';

const Menu = () => {
  const [activeTab, setActiveTab] = useState('breakfast');

  const menuData = {
    smoothies: [
      {
        name: "SUPERFOOD SMOOTHIE",
        description: "Blueberry, banana, chia seeds, coconut, peanut butter & fresh milk",
        price: 12,
        dietary: ['gfo', 'dfo', 'vo', 'cn']
      },
      {
        name: "FRESHLY SQUEEZED ORANGE JUICE",
        price: 9
      },
      {
        name: "MILKSHAKES",
        description: "Vanilla / Caramel / Strawberry / Chocolate",
        price: 9
      }
    ],
    coffee: {
      note: "regular · 4.80 | medium · 5.80 | large · 6.80",
      items: [
        {
          name: "Black / White",
          suffix: "regular",
          price: 4.80,
          additions: [
            { name: "+ extra shot", price: 0.80 },
            { name: "+ decaf", price: 0.80 },
            { name: "+ soy", price: 0.80 },
            { name: "+ almond", price: 0.80 },
            { name: "+ lactose free milk", price: 0.80 },
            { name: "+ oats milk", price: 0.80 }
          ]
        },
        { name: "Matcha Latte", price: 6 },
        { name: "Iced Matcha", price: 7 },
        { name: "Iced Latte", suffix: "served on tall glass", price: 7 },
        { name: "Iced Long Black", suffix: "served on tall glass", price: 6 },
        { name: "Iced Coffee / Iced Chocolate", suffix: "comes with ice cream", price: 8 },
        { name: "Iced Mocha / Iced Chia", suffix: "comes with ice cream", price: 8 },
        { name: "Magic", price: 5.50 },
        { name: "Batch Brew", price: 6 },
        { name: "Cold Brew", price: 7 }
      ]
    },
    tea: {
      items: [
        { name: "English Breakfast, Earl Gray, Green, Lemongrass & Ginger, Peppermint, Camomile", price: 5.50 },
        { name: "Brew Chai Latte", suffix: "leaves", price: 6 },
        { name: "Spiced Chai Latte", suffix: "powder", price: 5 }
      ]
    },
    eggs: [
      { name: "EGGS YOUR WAY", suffix: "on Ciabatta", description: "Poached / Fried", price: 13 },
      { name: "SCRAMBLED EGG", suffix: "on Ciabatta", price: 14 }
    ],
    breakfast: [
      { name: "TOAST", suffix: "w/ jam/butter/vegemite", price: 9 },
      { name: "FRUIT TOAST", price: 10 },
      {
        name: "BIRCHER MUESLI",
        description: "Poached pears, chia, coconut, dates and seeds, honey yoghurt, strawberry, granola, pistachio and caramel syrup",
        price: 17,
        dietary: ['cn']
      },
      {
        name: "PORRIDGE",
        description: "Oat and chia seeds cooked with milk, coconut yoghurt, banana, toasted coconut, pistachio and maple",
        price: 19,
        dietary: ['cn']
      },
      {
        name: "FRENCH TOAST",
        description: "Thick cut brioche, strawberries, poached pears, cream and maple syrup",
        price: 21,
        additions: [{ name: "+ bacon", price: 7 }]
      },
      {
        name: "EGGS BENEDICT",
        description: "Kaiserfleisch (thick smoked bacon) apple & mint salad, apple sauce and poached eggs topped with hollandaise sauce on ciabatta",
        price: 24,
        dietary: ['gfo'],
        additions: [{ name: "+ hash brown", price: 6 }]
      },
      {
        name: "GREEN BOWL",
        description: "Shredded kale & spinach, beetroot, quinoa, feta, cranberry, roasted pumpkin, broccoli, fresh herbs, pepitas, dukkha, poached egg, avocado and house dressing on multigrain",
        price: 24,
        dietary: ['gfo', 'dfo', 'vo', 'cn']
      },
      {
        name: "SMOKE SALMON ON SOURDOUGH",
        description: "Cream cheese, herb mixed pumpkin, avocado, poached egg, capper dressing on sourdough",
        price: 25.50,
        dietary: ['gfo', 'dfo']
      },
      {
        name: "FRESH AVOCADO",
        description: "w/ cherry tomato, dukkah, pesta, feta, chilli flakes, pomegranate, poached egg and lemon",
        price: 23,
        dietary: ['gfo', 'dfo', 'vo', 'cn'],
        additions: [
          { name: "+ bacon", price: 7 },
          { name: "+ hashbrown", price: 6 }
        ]
      },
      {
        name: "TRIPLE CHEESE BRIOCHE",
        description: "w/ herbs, fried egg and bechamel sauce",
        price: 23,
        additions: [{ name: "+ ham", price: 3 }]
      },
      {
        name: "BREAKFAST BURGER",
        description: "Creamy herbs scramble, double smoke bacon, cheese, chilli mayo and tomato relish",
        price: 19,
        additions: [
          { name: "+ chips", price: 7 },
          { name: "+ hash brown", price: 6 }
        ]
      },
      {
        name: "SUGO POT",
        description: "Chorizo, bacon, kipfler potato, cannellini beans cooked with tomato sugo, basil pesto, feta, poached egg on ciabatta",
        price: 24,
        dietary: ['gfo', 'nfo', 'dfo']
      },
      {
        name: "GOAT CHEESE & CHILLI FOLDED EGGS",
        description: "Scramble with mixed herbs, goat cheese on multigrain",
        price: 22,
        dietary: ['gfo', 'dfo'],
        additions: [
          { name: "+ bacon", price: 7 },
          { name: "+ hashbrown", price: 6 },
          { name: "+ chorizo", price: 6 }
        ]
      }
    ],
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
        dietary: ['gfo', 'dfo', 'nfo']
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
      gfo: { label: "GFO", color: "bg-green-50 text-green-700 border border-green-200", title: "Gluten Free Option" },
      dfo: { label: "DFO", color: "bg-blue-50 text-blue-700 border border-blue-200", title: "Dairy Free Option" },
      nfo: { label: "NFO", color: "bg-purple-50 text-purple-700 border border-purple-200", title: "Nut Free Option" },
      nfs: { label: "NFO", color: "bg-purple-50 text-purple-700 border border-purple-200", title: "Nut Free" },
      vo: { label: "VO", color: "bg-emerald-50 text-emerald-700 border border-emerald-200", title: "Vegan Option" },
      cn: { label: "CN", color: "bg-amber-50 text-amber-700 border border-amber-200", title: "Contains Nuts" }
    };
    const badge = badges[type] || { label: type, color: "bg-gray-100 text-gray-600 border border-gray-200" };
    return (
      <span
        className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold tracking-wide ${badge.color}`}
        title={badge.title}
      >
        {badge.label}
      </span>
    );
  };

  const Price = ({ price }) => (
    <span className="text-gray-700 font-semibold text-sm sm:text-base whitespace-nowrap" style={{ fontFamily: 'arial' }}>
      ${Number.isInteger(price) ? price : price.toFixed(2)}
    </span>
  );

  const tabs = [
    { id: 'breakfast', label: 'Breakfast' },
    { id: 'lunch', label: 'Lunch' },
    { id: 'drinks', label: 'Drinks' },
  ];

  return (
    <div className="bg-white pt-8 relative overflow-hidden">
      <section className="relative max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Centered faint background image */}
        <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-0">
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
              All Day Breakfast · Kitchen closes at 2:00
            </p>
          </div>

          {/* ─── BONJOUR / BREAKFAST + EGGS ─────────────────── */}
          {/* Eggs */}
          <section className="mb-10 sm:mb-12">
            <h2
              className="text-xl sm:text-2xl font-semibold mb-6 pb-2 border-b border-gray-300 text-gray-800 tracking-wider uppercase"
              style={{ fontFamily: 'playfairbold' }}
            >
              Eggs
            </h2>
            <div className="space-y-4" style={{ fontFamily: 'arial' }}>
              {menuData.eggs.map((item, idx) => (
                <div key={idx}>
                  <div className="flex justify-between items-baseline mb-0.5">
                    <span className="text-base sm:text-lg font-semibold text-gray-800 uppercase">
                      {item.name}
                      {item.suffix && <span className="text-xs font-normal text-gray-500 normal-case ml-1 italic">{item.suffix}</span>}
                    </span>
                    <Price price={item.price} />
                  </div>
                  {item.description && <p className="text-gray-500 text-sm italic">{item.description}</p>}
                </div>
              ))}
            </div>
          </section>

          {/* Breakfast */}
          <section className="mb-10 sm:mb-12">
            <h2
              className="text-xl sm:text-2xl font-semibold mb-6 pb-2 border-b border-gray-300 text-gray-800 tracking-wider uppercase"
              style={{ fontFamily: 'playfairbold' }}
            >
              Breakfast
            </h2>
            <div className="space-y-6" style={{ fontFamily: 'arial' }}>
              {menuData.breakfast.map((item, idx) => (
                <div key={idx}>
                  <div className="flex justify-between items-baseline mb-1">
                    <span className="text-base sm:text-lg font-semibold text-gray-800 uppercase">
                      {item.name}
                      {item.suffix && <span className="text-xs font-normal text-gray-500 normal-case ml-1 italic">{item.suffix}</span>}
                    </span>
                    <Price price={item.price} />
                  </div>
                  {item.description && (
                    <p className="text-gray-500 text-sm italic mb-1.5">{item.description}</p>
                  )}
                  {item.dietary && (
                    <div className="flex gap-1.5 mb-1.5">
                      {item.dietary.map((d) => <DietaryBadge key={d} type={d} />)}
                    </div>
                  )}
                  {item.additions && (
                    <div className="flex flex-wrap gap-2 mt-1">
                      {item.additions.map((add, i) => (
                        <span key={i} className="inline-flex items-center px-2 py-0.5 text-xs text-gray-600 border border-gray-200 rounded-sm">
                          {add.name} <span className="ml-1 text-gray-400 font-medium">+${add.price}</span>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* ─── SMOOTHIE ─────────────────────────────────────── */}
          <section className="mb-10 sm:mb-12">
            <h2
              className="text-xl sm:text-2xl font-semibold mb-6 pb-2 border-b border-gray-300 text-gray-800 tracking-wider uppercase"
              style={{ fontFamily: 'playfairbold' }}
            >
              Smoothie
            </h2>
            <div className="space-y-5" style={{ fontFamily: 'arial' }}>
              {menuData.smoothies.map((item, idx) => (
                <div key={idx}>
                  <div className="flex justify-between items-baseline mb-1">
                    <span className="text-base sm:text-lg font-semibold text-gray-800 uppercase">{item.name}</span>
                    <Price price={item.price} />
                  </div>
                  {item.description && <p className="text-gray-500 text-sm italic mb-1">{item.description}</p>}
                  {item.dietary && (
                    <div className="flex gap-1.5">
                      {item.dietary.map((d) => <DietaryBadge key={d} type={d} />)}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* ─── COFFEE ───────────────────────────────────────── */}
          <section className="mb-10 sm:mb-12">
            <h2
              className="text-xl sm:text-2xl font-semibold mb-2 pb-2 border-b border-gray-300 text-gray-800 tracking-wider uppercase"
              style={{ fontFamily: 'playfairbold' }}
            >
              Coffee
            </h2>
            <p className="text-xs text-gray-400 italic mb-5 text-center" style={{ fontFamily: 'arial' }}>
              {menuData.coffee.note}
            </p>
            <div className="space-y-4" style={{ fontFamily: 'arial' }}>
              {menuData.coffee.items.map((item, idx) => (
                <div key={idx}>
                  <div className="flex justify-between items-baseline mb-0.5">
                    <span className="text-base font-semibold text-gray-800">
                      {item.name}
                      {item.suffix && <span className="text-xs font-normal text-gray-500 normal-case ml-1 italic">{item.suffix}</span>}
                    </span>
                    <Price price={item.price} />
                  </div>
                  {item.additions && (
                    <div className="ml-3 mt-1 space-y-0.5">
                      {item.additions.map((add, i) => (
                        <div key={i} className="flex justify-between items-center">
                          <span className="text-gray-500 text-sm">{add.name}</span>
                          <span className="text-gray-500 text-sm">+${add.price.toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* ─── TEA ──────────────────────────────────────────── */}
          <section className="mb-10 sm:mb-12">
            <h2
              className="text-xl sm:text-2xl font-semibold mb-6 pb-2 border-b border-gray-300 text-gray-800 tracking-wider uppercase"
              style={{ fontFamily: 'playfairbold' }}
            >
              Tea
            </h2>
            <div className="space-y-4" style={{ fontFamily: 'arial' }}>
              {menuData.tea.items.map((item, idx) => (
                <div key={idx} className="flex justify-between items-baseline">
                  <span className="text-gray-700 text-sm sm:text-base pr-4">
                    {item.name}
                    {item.suffix && <span className="text-xs text-gray-400 italic ml-1">{item.suffix}</span>}
                  </span>
                  <Price price={item.price} />
                </div>
              ))}
            </div>
          </section>

          {/* ─── LUNCH ────────────────────────────────────────── */}
          <section className="mb-10 sm:mb-12">
            <h2
              className="text-xl sm:text-2xl font-semibold mb-6 pb-2 border-b border-gray-300 text-gray-800 tracking-wider uppercase"
              style={{ fontFamily: 'playfairbold' }}
            >
              Lunch
            </h2>

            {/* Hot Chips */}
            <div className="mb-6">
              <div className="flex justify-between items-baseline mb-1">
                <span className="text-base sm:text-lg font-semibold text-gray-800 uppercase" style={{ fontFamily: 'arial' }}>{menuData.lunch.hotChips.name}</span>
                <Price price={menuData.lunch.hotChips.price} />
              </div>
              <p className="text-gray-500 text-sm italic" style={{ fontFamily: 'arial' }}>{menuData.lunch.hotChips.description}</p>
            </div>

            {/* Bruschetta */}
            <div className="mb-6">
              <div className="flex justify-between items-baseline mb-1">
                <span className="text-base sm:text-lg font-semibold text-gray-800 uppercase" style={{ fontFamily: 'arial' }}>{menuData.lunch.bruschetta.name}</span>
                <Price price={menuData.lunch.bruschetta.price} />
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
            <div className="mb-6">
              <div className="flex justify-between items-baseline mb-1">
                <span className="text-base sm:text-lg font-semibold text-gray-800 uppercase" style={{ fontFamily: 'arial' }}>{menuData.lunch.crumbChicken.name}</span>
                <Price price={menuData.lunch.crumbChicken.price} />
              </div>
              <p className="text-gray-500 text-sm italic" style={{ fontFamily: 'arial' }}>{menuData.lunch.crumbChicken.description}</p>
            </div>

            {/* Lamb Salad */}
            <div className="mb-6">
              <div className="flex justify-between items-baseline mb-1">
                <span className="text-base sm:text-lg font-semibold text-gray-800 uppercase" style={{ fontFamily: 'arial' }}>{menuData.lunch.lambSalad.name}</span>
                <Price price={menuData.lunch.lambSalad.price} />
              </div>
              <p className="text-gray-500 text-sm italic mb-2" style={{ fontFamily: 'arial' }}>{menuData.lunch.lambSalad.description}</p>
              <div className="flex gap-1.5">
                {menuData.lunch.lambSalad.dietary.map((diet) => (
                  <DietaryBadge key={diet} type={diet} />
                ))}
              </div>
            </div>

            {/* Toasted Pita */}
            <div className="mb-6">
              <div className="flex justify-between items-baseline mb-3">
                <span className="text-base sm:text-lg font-semibold text-gray-800 uppercase" style={{ fontFamily: 'arial' }}>{menuData.lunch.toastedPita.name}</span>
                <Price price={menuData.lunch.toastedPita.price} />
              </div>
              <div className="ml-2 sm:ml-4 pl-3 border-l-[1.5px] border-gray-200 space-y-4">
                {menuData.lunch.toastedPita.options.map((option, idx) => (
                  <div key={idx}>
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

          {/* ─── KIDS MENU ────────────────────────────────────── */}
          <section className="mb-10 sm:mb-12">
            <h2
              className="text-xl sm:text-2xl font-semibold mb-6 pb-2 border-b border-gray-300 text-gray-800 tracking-wider uppercase"
              style={{ fontFamily: 'playfairbold' }}
            >
              Kids Only
            </h2>
            <div className="space-y-3" style={{ fontFamily: 'arial' }}>
              {menuData.kids.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center">
                  <span className="text-gray-700 text-sm sm:text-base">• {item.name}</span>
                  <Price price={item.price} />
                </div>
              ))}
            </div>
          </section>

          {/* ─── SANDWICHES ───────────────────────────────────── */}
          <section className="mb-10 sm:mb-12">
            <h2
              className="text-xl sm:text-2xl font-semibold mb-6 pb-2 border-b border-gray-300 text-gray-800 tracking-wider uppercase"
              style={{ fontFamily: 'playfairbold' }}
            >
              Sandwiches
            </h2>
            <div className="space-y-3" style={{ fontFamily: 'arial' }}>
              {menuData.sandwiches.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center">
                  <span className="text-gray-700 text-sm sm:text-base">{item.name}</span>
                  <Price price={item.price} />
                </div>
              ))}
            </div>
          </section>

          {/* ─── BEVERAGES ────────────────────────────────────── */}
          <section className="mb-10 sm:mb-12">
            <h2
              className="text-xl sm:text-2xl font-semibold mb-4 pb-2 border-b border-gray-300 text-gray-800 tracking-wider uppercase"
              style={{ fontFamily: 'playfairbold' }}
            >
              Cold Juice · Kombucha · Fiji Drinks
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4" style={{ fontFamily: 'arial' }}>
              {/* Left column */}
              <div className="space-y-3">
                {menuData.drinks.soft.map((drink, idx) => (
                  <div key={idx} className="flex justify-between items-center">
                    <span className="text-gray-700 text-sm sm:text-base">{drink.name}</span>
                    <Price price={drink.price} />
                  </div>
                ))}
                <div>
                  <div className="flex justify-between items-center mb-0.5">
                    <span className="text-gray-700 text-sm sm:text-base">{menuData.drinks.fiji.title}</span>
                    <Price price={menuData.drinks.fiji.price} />
                  </div>
                  <p className="text-xs text-gray-400 italic">{menuData.drinks.fiji.flavors.join(' · ')}</p>
                </div>
              </div>
              {/* Right column */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-700 text-sm sm:text-base">{menuData.drinks.sparkling.name}</span>
                  <Price price={menuData.drinks.sparkling.price} />
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-700 text-sm sm:text-base">{menuData.drinks.kombucha.name}</span>
                  <Price price={menuData.drinks.kombucha.price} />
                </div>
                <div>
                  <div className="flex justify-between items-center mb-0.5">
                    <span className="text-gray-700 text-sm sm:text-base">{menuData.drinks.juice.name}</span>
                    <Price price={menuData.drinks.juice.price} />
                  </div>
                  <p className="text-xs text-gray-400 italic">{menuData.drinks.juice.flavors.join(' · ')}</p>
                </div>
              </div>
            </div>
          </section>

          {/* ─── SIDES ────────────────────────────────────────── */}
          <section className="mb-10 sm:mb-12">
            <h2
              className="text-xl sm:text-2xl font-semibold mb-6 pb-2 border-b border-gray-300 text-gray-800 tracking-wider uppercase"
              style={{ fontFamily: 'playfairbold' }}
            >
              Sides &amp; Add-Ons
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3" style={{ fontFamily: 'arial' }}>
              {menuData.sides.items.map((item, idx) => (
                <div key={idx} className="flex justify-between items-start pt-2 border-t border-gray-100">
                  <span className="text-gray-700 text-sm pr-4">{item.name}</span>
                  <Price price={item.price} />
                </div>
              ))}
            </div>
          </section>

          {/* ─── DIETARY KEY ──────────────────────────────────── */}
          <div className="mb-10 pt-6 border-t border-gray-200">
            <h3 className="text-xs font-semibold mb-3 text-gray-400 uppercase tracking-widest text-center" style={{ fontFamily: 'arial' }}>
              Dietary Information
            </h3>
            <div className="flex flex-wrap justify-center gap-x-6 gap-y-2">
              {[
                "GFO – Gluten Free Option",
                "DFO – Dairy Free Option",
                "VO – Vegan Option",
                "CN – Contains Nuts"
              ].map((label) => (
                <span key={label} className="text-xs text-gray-500 uppercase tracking-wide" style={{ fontFamily: 'arial' }}>
                  {label}
                </span>
              ))}
            </div>
          </div>

          {/* ─── FOOTER ───────────────────────────────────────── */}
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
                Please make this known when ordering meals. Thank you.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Menu;