import { useEffect, useMemo, useRef, useState } from "react";
import CollectionsSection from "./CollectionsSection";

const fitOptions = ["Regular", "Oversized", "Slim"];
const colorOptions = ["Black", "White", "Merun", "Sky blue", "Bottle green", "Navy blue"];
const genderOptions = ["Men", "Women", "Unisex"];
const sizeOptions = ["M", "L", "XL", "2XL", "3XL"];

function FilterCheckbox({ label, checked, onChange }) {
  return (
    <label className="flex items-center gap-2 text-[13px] sm:text-[14px] text-[#333333] cursor-pointer">
      <input type="checkbox" checked={checked} onChange={onChange} className="accent-[#C9A14A]" />
      {label}
    </label>
  );
}

export default function CollectionPage({ products = [], isLoading = false }) {
  const [sortBy, setSortBy] = useState("newest");
  const [sortOpen, setSortOpen] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [sortSectionOpen, setSortSectionOpen] = useState(false);
  const sortRef = useRef(null);
  const [selectedFits, setSelectedFits] = useState([]);
  const [selectedColors, setSelectedColors] = useState([]);
  const [selectedGender, setSelectedGender] = useState([]);
  const [selectedSizes, setSelectedSizes] = useState([]);
  const [onlyOffers, setOnlyOffers] = useState(false);
  const [onlyNewArrivals, setOnlyNewArrivals] = useState(false);
  const [minPrice, setMinPrice] = useState(120);
  const [maxPrice, setMaxPrice] = useState(260);

  const enrichedProducts = useMemo(
    () =>
      products.map((item, index) => ({
        ...item,
        fit: fitOptions[index % fitOptions.length],
        color: item.colors?.[0] || colorOptions[index % colorOptions.length],
        gender: genderOptions[index % genderOptions.length],
        size: item.sizes?.[0] || sizeOptions[index % sizeOptions.length],
        isNewArrival: item.badge === "New Arrival",
      })),
    [products]
  );

  const filteredProducts = useMemo(() => {
    const output = enrichedProducts.filter((product) => {
      if (product.offerPrice < minPrice || product.offerPrice > maxPrice) return false;
      if (selectedFits.length && !selectedFits.includes(product.fit)) return false;
      if (selectedColors.length && !selectedColors.includes(product.color)) return false;
      if (selectedGender.length && !selectedGender.includes(product.gender)) return false;
      if (selectedSizes.length && !selectedSizes.includes(product.size)) return false;
      if (onlyOffers && product.offerPrice >= product.originalPrice) return false;
      if (onlyNewArrivals && !product.isNewArrival) return false;
      return true;
    });

    if (sortBy === "price_low_high") return output.sort((a, b) => a.offerPrice - b.offerPrice);
    if (sortBy === "price_high_low") return output.sort((a, b) => b.offerPrice - a.offerPrice);
    return output.sort((a, b) => b.id - a.id);
  }, [enrichedProducts, minPrice, maxPrice, selectedFits, selectedColors, selectedGender, selectedSizes, onlyOffers, onlyNewArrivals, sortBy]);

  const sortLabel =
    sortBy === "price_low_high"
      ? "Price - Low to High"
      : sortBy === "price_high_low"
        ? "Price - High to Low"
        : "Newest First";

  const toggleSelection = (value, values, setValues) => {
    setValues(values.includes(value) ? values.filter((item) => item !== value) : [...values, value]);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sortRef.current && !sortRef.current.contains(event.target)) {
        setSortOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-8 sm:py-10 lg:py-12">
      <div className="text-center mb-8">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl text-[#0A0A0A]" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
          Collection
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-6 lg:gap-8">
        <div className="lg:hidden">
          <button
            type="button"
            onClick={() => setFiltersOpen((value) => !value)}
            className="w-full rounded-full border border-[#C9A14A]/30 px-5 py-3 flex items-center justify-between text-[13px] tracking-[0.12em] uppercase text-[#333333]"
          >
            <span>Categories & Filters</span>
            <span className="text-[#C9A14A]">{filtersOpen ? "▲" : "▼"}</span>
          </button>
        </div>

        <aside className={`rounded-3xl border border-[#C9A14A]/25 p-5 sm:p-6 space-y-5 h-fit ${filtersOpen ? "block" : "hidden"} lg:block`}>
          <div>
            <p className="text-[13px] tracking-[0.16em] uppercase text-[#C9A14A] mb-2 font-semibold">Categories</p>
            <label className="flex items-center gap-2 text-[14px] text-[#333333]">
              <input type="checkbox" checked readOnly className="accent-[#C9A14A]" />
              Tshirts
            </label>
          </div>
          <div>
            <p className="text-[13px] tracking-[0.16em] uppercase text-[#C9A14A] mb-2 font-semibold">Fit</p>
            <div className="space-y-1.5">
              {fitOptions.map((fit) => (
                <FilterCheckbox
                  key={fit}
                  label={fit}
                  checked={selectedFits.includes(fit)}
                  onChange={() => toggleSelection(fit, selectedFits, setSelectedFits)}
                />
              ))}
            </div>
          </div>
          <div>
            <p className="text-[13px] tracking-[0.16em] uppercase text-[#C9A14A] mb-2 font-semibold">Color</p>
            <div className="space-y-1.5">
              {colorOptions.map((color) => (
                <FilterCheckbox
                  key={color}
                  label={color}
                  checked={selectedColors.includes(color)}
                  onChange={() => toggleSelection(color, selectedColors, setSelectedColors)}
                />
              ))}
            </div>
          </div>
          <div>
            <p className="text-[13px] tracking-[0.16em] uppercase text-[#C9A14A] mb-2 font-semibold">Gender</p>
            <div className="space-y-1.5">
              {genderOptions.map((gender) => (
                <FilterCheckbox
                  key={gender}
                  label={gender}
                  checked={selectedGender.includes(gender)}
                  onChange={() => toggleSelection(gender, selectedGender, setSelectedGender)}
                />
              ))}
            </div>
          </div>
          <div>
            <p className="text-[13px] tracking-[0.16em] uppercase text-[#C9A14A] mb-2 font-semibold">Size</p>
            <div className="space-y-1.5">
              {sizeOptions.map((size) => (
                <FilterCheckbox
                  key={size}
                  label={size}
                  checked={selectedSizes.includes(size)}
                  onChange={() => toggleSelection(size, selectedSizes, setSelectedSizes)}
                />
              ))}
            </div>
          </div>
          <div>
            <p className="text-[13px] tracking-[0.16em] uppercase text-[#C9A14A] mb-2 font-semibold">Price (AED)</p>
            <div className="space-y-2">
              <input
                type="range"
                min="100"
                max="300"
                value={minPrice}
                onChange={(e) => setMinPrice(Math.min(Number(e.target.value), maxPrice - 1))}
                className="w-full accent-[#C9A14A]"
              />
              <input
                type="range"
                min="100"
                max="300"
                value={maxPrice}
                onChange={(e) => setMaxPrice(Math.max(Number(e.target.value), minPrice + 1))}
                className="w-full accent-[#C9A14A]"
              />
              <p className="text-[13px] text-[#333333]">AED {minPrice} - AED {maxPrice}</p>
            </div>
          </div>
          <div>
            <p className="text-[13px] tracking-[0.16em] uppercase text-[#C9A14A] mb-2 font-semibold">Offers</p>
            <FilterCheckbox label="Only discounted items" checked={onlyOffers} onChange={() => setOnlyOffers((v) => !v)} />
          </div>
          <div>
            <p className="text-[13px] tracking-[0.16em] uppercase text-[#C9A14A] mb-2 font-semibold">New Arrivals</p>
            <FilterCheckbox label="Show new arrivals" checked={onlyNewArrivals} onChange={() => setOnlyNewArrivals((v) => !v)} />
          </div>
        </aside>

        <div>
          {isLoading && (
            <div className="mb-4 rounded-2xl border border-[#C9A14A]/20 px-4 py-3 text-[13px] text-[#555555]">
              Loading products...
            </div>
          )}
          <div className="mb-3 sm:mb-4 lg:hidden">
            <button
              type="button"
              onClick={() => setSortSectionOpen((value) => !value)}
              className="w-full rounded-full border border-[#C9A14A]/30 px-5 py-3 flex items-center justify-between text-[13px] tracking-[0.12em] uppercase text-[#333333]"
            >
              <span>Sort By Section</span>
              <span className="text-[#C9A14A]">{sortSectionOpen ? "▲" : "▼"}</span>
            </button>
          </div>

          <div
            className={`mb-4 sm:mb-5 rounded-2xl border border-[#C9A14A]/20 px-4 sm:px-5 py-3.5 flex items-center justify-between gap-3 ${
              sortSectionOpen ? "flex" : "hidden"
            } lg:flex`}
          >
            <p className="text-[13px] sm:text-[14px] text-[#333333]">
              Showing {filteredProducts.length} product{filteredProducts.length === 1 ? "" : "s"}
            </p>
            <div ref={sortRef} className="flex items-center gap-2 relative">
              <label className="text-[12px] tracking-[0.12em] uppercase text-[#555555]">Sort By</label>
              <button
                type="button"
                onClick={() => setSortOpen((value) => !value)}
                className="min-w-[200px] border border-[#C9A14A]/30 rounded-full px-4 py-2 text-[13px] text-left flex items-center justify-between hover:border-[#C9A14A] transition-colors"
              >
                <span>{sortLabel}</span>
                <span className="text-[#C9A14A]">{sortOpen ? "▲" : "▼"}</span>
              </button>
              {sortOpen && (
                <div className="absolute right-0 top-full mt-2 w-full min-w-[200px] bg-white border border-[#C9A14A]/30 rounded-2xl shadow-lg z-20 overflow-hidden">
                  {[
                    { key: "price_low_high", label: "Price - Low to High" },
                    { key: "price_high_low", label: "Price - High to Low" },
                    { key: "newest", label: "Newest First" },
                  ].map((option) => (
                    <button
                      key={option.key}
                      type="button"
                      onClick={() => {
                        setSortBy(option.key);
                        setSortOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2.5 text-[13px] transition-colors ${
                        sortBy === option.key
                          ? "bg-[#C9A14A]/15 text-[#0A0A0A]"
                          : "text-[#333333] hover:bg-[#f8f7f2]"
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          <CollectionsSection
            showHeader={false}
            products={filteredProducts}
            gridClassName="grid grid-cols-1 md:grid-cols-2 gap-7 sm:gap-8"
            imageClassName="h-64 sm:h-72"
            titleClassName="text-2xl sm:text-[30px]"
            descriptionClassName="text-[14px] sm:text-[15px]"
          />
        </div>
      </div>
    </section>
  );
}
