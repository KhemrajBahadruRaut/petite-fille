"use client";

import React, { useState, useCallback, useRef } from "react";
import { User, Clock, Calendar } from "lucide-react";

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  serves: number;
  image: string;
  category: string;
}

interface FormData {
  numberOfGuests: string;
  eventTime: string;
  eventDate: string;
  deliveryAddress: string;
  pickupMyself: boolean;
  selectedItems: { [key: string]: number };
  servingSupplies: boolean;
  staffingAddOn1: boolean;
  staffingAddOn1Hours: string;
  staffingAddOn2: boolean;
  staffingAddOn2Hours: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  specialRequests: string;
}

const MultiStepCateringForm = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const today = new Date().toISOString().split("T")[0];
  const deliveryRef = useRef<HTMLInputElement | null>(null);

  const [formData, setFormData] = useState<FormData>({
    numberOfGuests: "10",
    eventTime: "17:30",
    eventDate: "",
    deliveryAddress: "",
    pickupMyself: false,
    selectedItems: {},
    servingSupplies: false,
    staffingAddOn1: false,
    staffingAddOn1Hours: "10",
    staffingAddOn2: false,
    staffingAddOn2Hours: "10",
    fullName: "",
    email: "",
    phoneNumber: "",
    specialRequests: "",
  });

  const allMenuItems: MenuItem[] = [ { id: "brunch1", name: "Lorem Ipsum", description: "Poached pears, chia, coconut, dates and seeds, honey yoghurt, strawberry, granola, pistachio and caramel syrup", price: 140, serves: 10, image: "🍳", category: "brunch", }, { id: "brunch2", name: "Lorem Ipsum", description: "Poached pears, chia, coconut, dates and seeds, honey yoghurt, strawberry, granola, pistachio and caramel syrup", price: 140, serves: 10, image: "🍳", category: "brunch", }, { id: "brunch3", name: "Lorem Ipsum", description: "Poached pears, chia, coconut, dates and seeds, honey yoghurt, strawberry, granola, pistachio and caramel syrup", price: 140, serves: 10, image: "🍳", category: "brunch", }, { id: "brunch4", name: "Lorem Ipsum", description: "Poached pears, chia, coconut, dates and seeds, honey yoghurt, strawberry, granola, pistachio and caramel syrup", price: 140, serves: 10, image: "🍳", category: "brunch", }, { id: "brunch5", name: "Lorem Ipsum", description: "Poached pears, chia, coconut, dates and seeds, honey yoghurt, strawberry, granola, pistachio and caramel syrup", price: 140, serves: 10, image: "🍳", category: "brunch", }, { id: "bakery1", name: "Croissant Platter", description: "Fresh butter croissants with chocolate and almond varieties", price: 120, serves: 10, image: "🥐", category: "bakery", }, { id: "bakery2", name: "Danish Pastries", description: "Assorted danish pastries with fruit and cream cheese fillings", price: 110, serves: 10, image: "🥐", category: "bakery", }, { id: "bakery3", name: "Muffin Selection", description: "Blueberry, chocolate chip, and banana nut muffins", price: 95, serves: 10, image: "🥐", category: "bakery", }, { id: "salad1", name: "Caesar Salad", description: "Classic caesar with romaine, parmesan, croutons and house dressing", price: 90, serves: 10, image: "🥗", category: "salads", }, { id: "salad2", name: "Greek Salad", description: "Fresh vegetables with feta, olives and olive oil dressing", price: 95, serves: 10, image: "🥗", category: "salads", }, { id: "salad3", name: "Garden Salad", description: "Mixed greens with seasonal vegetables and balsamic vinaigrette", price: 85, serves: 10, image: "🥗", category: "salads", }, { id: "sandwich1", name: "Club Sandwich Platter", description: "Triple-decker sandwiches with turkey, bacon, lettuce and tomato", price: 150, serves: 10, image: "🥪", category: "sandwiches", }, { id: "sandwich2", name: "Wrap Assortment", description: "Variety of wraps including chicken caesar, veggie and tuna", price: 130, serves: 10, image: "🥪", category: "sandwiches", }, { id: "sandwich3", name: "Gourmet Sandwich Selection", description: "Artisan breads with premium meats, cheeses and spreads", price: 145, serves: 10, image: "🥪", category: "sandwiches", }, { id: "beverage1", name: "Fresh Juice Bar", description: "Orange, apple, and tropical fruit juices", price: 80, serves: 10, image: "🥤", category: "beverages", }, { id: "beverage2", name: "Coffee & Tea Station", description: "Premium coffee and selection of teas with milk and sugar", price: 70, serves: 10, image: "🥤", category: "beverages", }, { id: "beverage3", name: "Soft Drinks Package", description: "Assorted sodas, sparkling water, and iced tea", price: 60, serves: 10, image: "🥤", category: "beverages", }, ];
  const nextStep = () => setCurrentStep((prev) => Math.min(prev + 1, 5));
  const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 1));
  const updateFormData = useCallback((field: string, value: string | number | boolean | Date | Record<string, number>) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }, []);

  // ------------------- STEP 1: EVENT DETAILS -------------------
  const EventDetailsStep = () => {
    const handleDeliveryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const start = e.target.selectionStart;
      const end = e.target.selectionEnd;
      const value = e.target.value;
      updateFormData("deliveryAddress", value);
      setTimeout(() => {
        try {
          if (deliveryRef.current && start !== null && end !== null) {
            deliveryRef.current.setSelectionRange(start, end);
            deliveryRef.current.focus();
          }
        } catch {}
      }, 0);
    };

    return (
      <div className="space-y-8">
        <h2 className="text-3xl font-serif text-gray-800">Event Details</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-gray-700 font-medium mb-2">Number of Guests</label>
            <div className="relative">
              <User className="absolute left-3 top-3 text-gray-400" size={18} />
              <input
                type="number"
                min="1"
                value={formData.numberOfGuests}
                onChange={(e) => updateFormData("numberOfGuests", e.target.value)}
                className="pl-10 pr-4 py-2 w-full border text-gray-800 border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-700"
                placeholder="Enter guest count"
              />
            </div>
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-2">Event Date</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-3 text-gray-400" size={18} />
              <input
                type="date"
                min={today}
                value={formData.eventDate}
                onChange={(e) => updateFormData("eventDate", e.target.value)}
                className="pl-10 pr-4 py-2 text-gray-800 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-700"
              />
            </div>
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-2">Event Time</label>
            <div className="relative">
              <Clock className="absolute left-3 top-3 text-gray-400" size={18} />
              <input
                type="time"
                value={formData.eventTime}
                onChange={(e) => updateFormData("eventTime", e.target.value)}
                className="pl-10 pr-4 py-2 text-gray-800 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-700"
              />
            </div>
          </div>

          {!formData.pickupMyself && (
            <div>
              <label className="block text-gray-700 font-medium mb-2">Delivery Address</label>
              <input
                ref={deliveryRef}
                type="text"
                value={formData.deliveryAddress}
                onChange={handleDeliveryChange}
                className="px-4 py-2 text-gray-800 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-700"
                placeholder="Enter your address"
              />
            </div>
          )}

          <div className="flex items-center space-x-3 mt-2">
            <input
              type="checkbox"
              id="pickupMyself"
              checked={formData.pickupMyself}
              onChange={(e) => updateFormData("pickupMyself", e.target.checked)}
              className="w-5 h-5 text-gray-700 rounded"
            />
            <label htmlFor="pickupMyself" className="text-gray-700 font-medium">I&apos;ll pick up myself</label>
          </div>
        </div>

        <div className="flex justify-end mt-10">
          <button onClick={nextStep} className="px-8 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition">
            Next
          </button>
        </div>
      </div>
    );
  };

  // ------------------- STEP 2: BUILD YOUR MENU (FIXED) -------------------
  const [selectedCategory, setSelectedCategory] = useState("brunch");

  const addItem = (itemId: string) => {
    setFormData((prev) => ({
      ...prev,
      selectedItems: { ...prev.selectedItems, [itemId]: (prev.selectedItems[itemId] || 0) + 1 },
    }));
  };

  const removeItem = (itemId: string) => {
    setFormData((prev) => {
      const newSelectedItems = { ...prev.selectedItems };
      if (!newSelectedItems[itemId] || newSelectedItems[itemId] <= 1) {
        delete newSelectedItems[itemId];
      } else {
        newSelectedItems[itemId] -= 1;
      }
      return { ...prev, selectedItems: newSelectedItems };
    });
  };

  const BuildMenuStep = () => {
    const categories = [
      { id: "brunch", name: "Brunch", emoji: "🍳" },
      { id: "bakery", name: "Bakery", emoji: "🥐" },
      { id: "salads", name: "Salads", emoji: "🥗" },
      { id: "sandwiches", name: "Sandwiches", emoji: "🥪" },
      { id: "beverages", name: "Beverages", emoji: "🥤" },
    ];

    const menuItems = allMenuItems.filter((item) => item.category === selectedCategory);

    return (
      <div className="space-y-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-3">Build Your Menu</h1>
        <div className="flex gap-4 overflow-x-auto pb-2">
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 rounded-full font-medium whitespace-nowrap ${
                selectedCategory === cat.id ? "bg-amber-700 text-white" : "bg-gray-200 text-gray-700"
              }`}
            >
              {cat.emoji} {cat.name}
            </button>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-6 max-h-[500px] overflow-y-auto pr-4" style={{ scrollBehavior: 'auto' }}>
          {menuItems.map((item) => (
            <div key={item.id} className="border p-4 rounded-lg flex justify-between items-start gap-4">
              <div className="space-y-2 flex-1">
                <div className="text-2xl">{item.image}</div>
                <h3 className="font-semibold text-gray-800">{item.name}</h3>
                <p className="text-sm text-gray-500">{item.description}</p>
                <p className="text-xs text-gray-400">Serves {item.serves} people</p>
              </div>
              <div className="flex flex-col gap-2 items-end">
                <span className="font-semibold text-gray-900">${item.price}</span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => removeItem(item.id)}
                    className="px-3 py-1 bg-gray-300 text-gray-700 rounded-md"
                  >
                    −
                  </button>
                  <span>{formData.selectedItems[item.id] || 0}</span>
                  <button
                    type="button"
                    onClick={() => addItem(item.id)}
                    className="px-3 py-1 bg-amber-700 text-white rounded-md"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-4 justify-center pt-8">
          <button
            type="button"
            onClick={prevStep}
            className="px-8 py-3 bg-gray-200 text-gray-700 rounded-md"
          >
            ← Back
          </button>
          <button
            type="button"
            onClick={nextStep}
            className="px-8 py-3 bg-amber-700 text-white rounded-md"
          >
            Next →
          </button>
        </div>
      </div>
    );
  };

  // ------------------- STEP 3: SUPPLIES & ADD-ONS -------------------
  const SuppliesStep = () => (
    <div className="space-y-8">
      <h1 className="text-3xl font-serif text-gray-800">Supplies & Add-ons</h1>

      <div className="space-y-6">
        <div className="flex items-start gap-8">
          <div className="font-medium text-gray-800 whitespace-nowrap pt-1">Serving supplies:</div>
          <div className="flex-1 space-y-3">
            <p className="text-gray-700">Need plates, napkins, and utensils?</p>
            <div className="flex gap-8">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.servingSupplies}
                  onChange={(e) => updateFormData("servingSupplies", e.target.checked)}
                  className="w-5 h-5 border-2 border-gray-400"
                />
                <span className="text-gray-800">Yes</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={!formData.servingSupplies}
                  onChange={(e) => updateFormData("servingSupplies", !e.target.checked)}
                  className="w-5 h-5 border-2 border-gray-400"
                />
                <span className="text-gray-800">No</span>
              </label>
            </div>
          </div>
        </div>

        <div className="flex items-start gap-8">
          <div className="font-medium text-gray-800 whitespace-nowrap pt-1">Staffing Add-on:</div>
          <div className="flex-1 space-y-3">
            <p className="text-gray-700">
              Lorem ipsum dolor sit amet, consec tetur adipiscing elit? <span className="text-gray-500">(Leave empty if not necessary)</span>
            </p>
            <div className="flex items-center gap-4">
              <span className="text-gray-800">If yes,</span>
              <User className="w-5 h-5 text-gray-600" />
              <select
                value={formData.staffingAddOn1Hours}
                onChange={(e) => updateFormData("staffingAddOn1Hours", e.target.value)}
                className="px-3 py-2 border-b-2 border-gray-300 bg-transparent focus:border-amber-700 focus:outline-none text-gray-800"
              >
                {[...Array(20)].map((_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {i + 1}
                  </option>
                ))}
              </select>
              <span className="text-gray-700">+$20 / hr</span>
            </div>
          </div>
        </div>

        <div className="flex items-start gap-8">
          <div className="font-medium text-gray-800 whitespace-nowrap pt-1">Staffing Add-on:</div>
          <div className="flex-1 space-y-3">
            <p className="text-gray-700">
              Lorem ipsum dolor sit amet, consec tetur adipiscing elit? <span className="text-gray-500">(Leave empty if not necessary)</span>
            </p>
            <div className="flex items-center gap-4">
              <span className="text-gray-800">If yes,</span>
              <User className="w-5 h-5 text-gray-600" />
              <select
                value={formData.staffingAddOn2Hours}
                onChange={(e) => updateFormData("staffingAddOn2Hours", e.target.value)}
                className="px-3 py-2 border-b-2 border-gray-300 bg-transparent focus:border-amber-700 focus:outline-none text-gray-800"
              >
                {[...Array(20)].map((_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {i + 1}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-4 pt-8 justify-center">
        <button
          type="button"
          onClick={prevStep}
          className="px-8 py-3 bg-white border border-gray-300 text-gray-700 rounded-md font-medium hover:bg-gray-50 transition-colors"
        >
          ← Back
        </button>
        <button
          type="button"
          onClick={nextStep}
          className="px-8 py-3 bg-amber-700 text-white rounded-md font-medium hover:bg-amber-800 transition-colors"
        >
          Next →
        </button>
      </div>
    </div>
  );

  // ------------------- STEP 4: CONTACT INFO -------------------
  const ContactInfoStep = () => (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Contact information</h1>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">Full Name</label>
        <p className="text-xs text-gray-500">For reservation</p>
        <input
          type="text"
          value={formData.fullName}
          onChange={(e) => updateFormData("fullName", e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-600 focus:border-transparent bg-white text-gray-900"
          placeholder="Your Name"
        />
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">Email address</label>
        <p className="text-xs text-gray-500">You will get a confirmation email</p>
        <input
          type="email"
          value={formData.email}
          onChange={(e) => updateFormData("email", e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-600 focus:border-transparent bg-white text-gray-900"
          placeholder="abc@gmail.com"
        />
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">Phone number</label>
        <p className="text-xs text-gray-500">Your number</p>
        <input
          type="tel"
          value={formData.phoneNumber}
          onChange={(e) => updateFormData("phoneNumber", e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-600 focus:border-transparent bg-white text-gray-900"
          placeholder="Your phone number"
        />
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">Any specific requests? (optional)</label>
        <textarea
          value={formData.specialRequests}
          onChange={(e) => updateFormData("specialRequests", e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-600 focus:border-transparent bg-white text-gray-900"
          placeholder="Type your message here ..."
          rows={4}
        />
      </div>

      <div className="flex gap-4">
        <button
          type="button"
          onClick={prevStep}
          className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-300 transition-colors"
        >
          ← Previous
        </button>
        <button
          type="button"
          onClick={nextStep}
          className="flex-1 bg-amber-700 text-white py-3 rounded-lg font-medium hover:bg-amber-800 transition-colors"
        >
          Next →
        </button>
      </div>
    </div>
  );

  // ------------------- STEP 5: REVIEW ORDER -------------------
  const ReviewOrderStep = () => {
    const [agreeToPolicy, setAgreeToPolicy] = useState(false);

    const selectedMenuItems = allMenuItems.filter((item) => (formData.selectedItems[item.id] || 0) > 0);

    const subtotal = selectedMenuItems.reduce((sum, item) => {
      const qty = formData.selectedItems[item.id] || 0;
      return sum + item.price * qty;
    }, 0);

    const updateQuantity = (itemId: string, delta: number) => {
      const newQuantity = Math.max(0, (formData.selectedItems[itemId] || 0) + delta);
      const newSelectedItems = { ...formData.selectedItems };
      if (newQuantity === 0) {
        delete newSelectedItems[itemId];
      } else {
        newSelectedItems[itemId] = newQuantity;
      }
      updateFormData("selectedItems", newSelectedItems);
    };

    const setQuantity = (itemId: string, value: number) => {
      const newQuantity = Math.max(0, value || 0);
      const newSelectedItems = { ...formData.selectedItems };
      if (newQuantity === 0) {
        delete newSelectedItems[itemId];
      } else {
        newSelectedItems[itemId] = newQuantity;
      }
      updateFormData("selectedItems", newSelectedItems);
    };

    return (
      <div className="space-y-8">
        <h1 className="text-3xl font-serif text-gray-800 text-center">Review your order</h1>

        <div className="border-2 border-gray-300 rounded-xl p-8 space-y-6">
          {selectedMenuItems.length > 0 ? (
            <>
              <div className="grid grid-cols-[1fr_auto_auto] gap-8 items-start pb-6 border-b border-gray-200">
                <div className="font-medium text-gray-800">Items</div>
                <div className="font-medium text-gray-800 text-center">Quantity</div>
                <div className="font-medium text-gray-800">Price</div>
              </div>

              {selectedMenuItems.map((item) => (
                <div key={item.id} className="grid grid-cols-[1fr_auto_auto] gap-8 items-start pb-6 border-b border-gray-200">
                  <div className="flex gap-4">
                    <div className="w-32 h-32 bg-gray-100 rounded-lg flex items-center justify-center text-4xl shrink-0">
                      {item.image}
                    </div>
                    <div className="space-y-2">
                      <h3 className="font-semibold text-gray-900">{item.name}</h3>
                      <p className="text-sm text-gray-500 leading-relaxed">{item.description}</p>
                      <p className="text-xs text-gray-400">Serves {item.serves} people</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 justify-center">
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.id, -1)}
                      className="w-8 h-8 rounded border border-gray-400 flex items-center justify-center hover:bg-gray-100 transition-colors text-gray-700"
                    >
                      −
                    </button>
                    <input
                      type="number"
                      value={formData.selectedItems[item.id] || 0}
                      onChange={(e) => setQuantity(item.id, parseInt(e.target.value, 10) || 0)}
                      className="w-16 h-8 text-center border border-gray-400 rounded text-gray-900"
                    />
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.id, 1)}
                      className="w-8 h-8 rounded border border-gray-400 flex items-center justify-center hover:bg-gray-100 transition-colors text-gray-700"
                    >
                      +
                    </button>
                  </div>

                  <div className="text-gray-900 font-medium text-right whitespace-nowrap">
                    ${((item.price * (formData.selectedItems[item.id] || 0)) || 0).toFixed(2)} AUD
                  </div>
                </div>
              ))}
            </>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <p className="text-lg">No items selected</p>
              <p className="text-sm mt-2">Go back to Build Menu to add items</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-x-16 gap-y-4 pt-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-800">Catering Date</span>
              <span className="font-semibold text-gray-900">
                {formData.eventDate
                  ? new Date(formData.eventDate + "T00:00:00").toLocaleDateString("en-US", {
                      day: "numeric",
                      month: "short",
                      year: "2-digit",
                    })
                  : "Not set"}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-gray-800">Subtotal</span>
              <span className="text-gray-900 font-semibold">${subtotal.toFixed(2)}</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-gray-800">Catering Time</span>
              <span className="font-semibold text-gray-900">
                {formData.eventTime
                  ? new Date(`2000-01-01T${formData.eventTime}`).toLocaleTimeString("en-US", {
                      hour: "numeric",
                      minute: "2-digit",
                      hour12: true,
                    })
                  : "Not set"}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-gray-800">Number of Guests</span>
              <span className="text-gray-900 font-semibold">{formData.numberOfGuests}</span>
            </div>
          </div>

          <div className="pt-4 space-y-4">
            <p className="text-sm text-gray-700 leading-relaxed">
              This is an estimated quote. Final price may adjust slightly based on final guest count. You will need to pay 20% advanced to confirm this catering order.
            </p>

            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={agreeToPolicy}
                onChange={(e) => setAgreeToPolicy(e.target.checked)}
                className="w-5 h-5 border-2 border-gray-400 mt-0.5 shrink-0"
              />
              <span className="text-sm text-gray-700">I agree to the terms and conditions and cancellation policy</span>
            </label>
          </div>
        </div>

        <div className="flex gap-4 pt-4 justify-center">
          <button
            type="button"
            onClick={prevStep}
            className="px-8 py-3 bg-white border border-gray-300 text-gray-700 rounded-md font-medium hover:bg-gray-50 transition-colors"
          >
            ← Back
          </button>
          <button
            type="button"
            onClick={() => alert("Proceeding to payment...")}
            className="px-8 py-3 bg-green-600 text-white rounded-md font-medium hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!agreeToPolicy || selectedMenuItems.length === 0}
          >
            Continue to payment →
          </button>
        </div>
      </div>
    );
  };

  // ------------------- PROGRESS INDICATOR -------------------
  const ProgressIndicator = () => (
    <div className="flex justify-between items-start mb-12 px-4">
      {[1, 2, 3, 4, 5].map((num) => (
        <div key={num} className="flex flex-col items-center gap-2 relative flex-1">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center font-semibold text-lg transition-colors ${currentStep >= num ? "bg-amber-600 text-white" : "bg-gray-400 text-white"}`}>
            {num}
          </div>
        </div>
      ))}
    </div>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1: return <EventDetailsStep />;
      case 2: return <BuildMenuStep />;
      case 3: return <SuppliesStep />;
      case 4: return <ContactInfoStep />;
      case 5: return <ReviewOrderStep />;
      default: return <EventDetailsStep />;
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f1e8] py-12 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-serif text-gray-800 mb-6">Build your own Catering</h1>
        </div>
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
          <ProgressIndicator />
          {renderCurrentStep()}
        </div>
      </div>
    </div>
  );
};

export default MultiStepCateringForm;