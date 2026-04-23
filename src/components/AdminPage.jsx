import { useEffect, useMemo, useState } from "react";
import { Navigate, Route, Routes, useNavigate } from "react-router-dom";
import { createAdminProduct, fetchAdminProducts, validateAdminSession } from "../lib/auth";

const colorOptions = ["Black", "White", "Merun", "Sky blue", "Bottle green", "Navy blue"];
const sizeOptions = ["M", "L", "XL", "2XL", "3XL"];

function PriceInputs({ actualPrice, offerPrice, onActualChange, onOfferChange }) {
  const discountPercent = useMemo(() => {
    const actual = Number(actualPrice);
    const offer = Number(offerPrice);
    if (!actual || actual <= 0 || offer < 0 || offer > actual) return 0;
    return Math.round(((actual - offer) / actual) * 100);
  }, [actualPrice, offerPrice]);

  return (
    <div className="rounded-2xl border border-[#C9A14A]/20 p-4 sm:p-5">
      <p className="text-[12px] tracking-[0.14em] uppercase text-[#C9A14A] mb-3 font-semibold">Pricing</p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <input
          type="number"
          min="0"
          value={actualPrice}
          onChange={(event) => onActualChange(event.target.value)}
          placeholder="Actual Price (AED)"
          className="border border-[#C9A14A]/30 rounded-xl px-3 py-2.5 text-[13px] outline-none focus:border-[#C9A14A]"
        />
        <input
          type="number"
          min="0"
          value={offerPrice}
          onChange={(event) => onOfferChange(event.target.value)}
          placeholder="Offer Price (AED)"
          className="border border-[#C9A14A]/30 rounded-xl px-3 py-2.5 text-[13px] outline-none focus:border-[#C9A14A]"
        />
        <input
          type="text"
          value={`${discountPercent}% OFF`}
          readOnly
          className="border border-[#C9A14A]/20 bg-[#f8f7f2] rounded-xl px-3 py-2.5 text-[13px] text-[#0A0A0A]"
        />
      </div>
    </div>
  );
}

function UploadProductPage({
  actualPrice,
  offerPrice,
  colorImageMap,
  isSaving,
  productDescription,
  productName,
  saveError,
  saveSuccess,
  selectedSizes,
  uploadedImages,
  onActualPriceChange,
  onColorMapChange,
  onDescriptionChange,
  onImageUpload,
  onOfferPriceChange,
  onProductNameChange,
  onSave,
  onToggleSize,
}) {
  const productPreview = {
    name: productName || "Product Name",
    description: productDescription || "Product description preview appears here.",
    actualPrice: actualPrice || "0",
    offerPrice: offerPrice || "0",
    sizes: selectedSizes.length ? selectedSizes.join(", ") : "No sizes selected",
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-6">
      <div className="space-y-5">
        <div className="rounded-2xl border border-[#C9A14A]/20 p-4 sm:p-5">
          <p className="text-[12px] tracking-[0.14em] uppercase text-[#C9A14A] mb-3 font-semibold">Basic Details</p>
          <div className="space-y-3">
            <input
              type="text"
              value={productName}
              onChange={(event) => onProductNameChange(event.target.value)}
              placeholder="Product Name (e.g. Premium Honeycomb T-shirt)"
              className="w-full border border-[#C9A14A]/30 rounded-xl px-3 py-2.5 text-[13px] outline-none focus:border-[#C9A14A]"
            />
            <textarea
              rows={4}
              value={productDescription}
              onChange={(event) => onDescriptionChange(event.target.value)}
              placeholder="Product Description"
              className="w-full border border-[#C9A14A]/30 rounded-xl px-3 py-2.5 text-[13px] outline-none focus:border-[#C9A14A] resize-none"
            />
          </div>
        </div>

        <div className="rounded-2xl border border-[#C9A14A]/20 p-4 sm:p-5">
          <p className="text-[12px] tracking-[0.14em] uppercase text-[#C9A14A] mb-3 font-semibold">Upload T-shirt Images</p>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={onImageUpload}
            className="block w-full text-[13px] text-[#333333] file:mr-3 file:rounded-full file:border-0 file:bg-[#C9A14A] file:px-4 file:py-2 file:text-[11px] file:font-semibold file:uppercase file:tracking-[0.1em] file:text-[#0A0A0A]"
          />
          {!!uploadedImages.length && (
            <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-3">
              {uploadedImages.map((image) => (
                <div key={image.id} className="rounded-xl border border-[#C9A14A]/20 p-2">
                  <img src={image.previewUrl} alt={image.fileName} className="w-full h-24 object-contain bg-[#f8f8f8] rounded-lg" />
                  <p className="text-[10px] text-[#555555] mt-1 truncate">{image.fileName}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-[#C9A14A]/20 p-4 sm:p-5">
          <p className="text-[12px] tracking-[0.14em] uppercase text-[#C9A14A] mb-3 font-semibold">Map Uploaded Image to Color</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {colorOptions.map((color) => (
              <div key={color}>
                <label className="block text-[11px] text-[#333333] mb-1">{color}</label>
                <select
                  value={colorImageMap[color] || ""}
                  onChange={(event) => onColorMapChange(color, event.target.value)}
                  className="w-full border border-[#C9A14A]/30 rounded-xl px-3 py-2.5 text-[13px] outline-none focus:border-[#C9A14A]"
                >
                  <option value="">Select uploaded image</option>
                  {uploadedImages.map((img) => (
                    <option key={`${color}-${img.id}`} value={img.id}>
                      {img.fileName}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-[#C9A14A]/20 p-4 sm:p-5">
          <p className="text-[12px] tracking-[0.14em] uppercase text-[#C9A14A] mb-3 font-semibold">Available Sizes</p>
          <div className="flex flex-wrap gap-2">
            {sizeOptions.map((size) => (
              <button
                key={size}
                type="button"
                onClick={() => onToggleSize(size)}
                className={`w-12 h-10 rounded-lg border text-[12px] font-semibold transition-colors ${
                  selectedSizes.includes(size)
                    ? "bg-[#C9A14A] border-[#C9A14A] text-[#0A0A0A]"
                    : "bg-white border-[#C9A14A]/30 text-[#333333]"
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>

        <PriceInputs
          actualPrice={actualPrice}
          offerPrice={offerPrice}
          onActualChange={onActualPriceChange}
          onOfferChange={onOfferPriceChange}
        />

        {saveError && (
          <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-[12px] text-red-300">
            {saveError}
          </p>
        )}
        {saveSuccess && (
          <p className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-[12px] text-emerald-300">
            {saveSuccess}
          </p>
        )}

        <button
          type="button"
          onClick={onSave}
          disabled={isSaving}
          className="w-full bg-[#0A0A0A] hover:bg-[#222222] disabled:opacity-60 disabled:cursor-not-allowed text-white rounded-full py-3 text-[11px] tracking-[0.12em] uppercase font-semibold"
        >
          {isSaving ? "Saving Product..." : "Save Product"}
        </button>
      </div>

      <div className="space-y-5">
        <div className="rounded-2xl border border-[#C9A14A]/20 p-4 sm:p-5 h-fit sticky top-20">
          <p className="text-[12px] tracking-[0.14em] uppercase text-[#C9A14A] mb-3 font-semibold">Preview</p>
          <div className="rounded-2xl border border-[#C9A14A]/20 overflow-hidden">
            <div className="h-64 bg-[#f8f8f8] p-3">
              {uploadedImages[0] ? (
                <img src={uploadedImages[0].previewUrl} alt="Preview" className="h-full w-full object-contain" />
              ) : (
                <div className="h-full w-full grid place-items-center text-[12px] text-[#777777]">Upload images to preview</div>
              )}
            </div>
            <div className="p-4">
              <h3 className="text-xl text-[#0A0A0A]" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                {productPreview.name}
              </h3>
              <p className="text-[13px] text-[#555555] mt-2">{productPreview.description}</p>
              <div className="mt-3 text-[13px]">
                <p className="line-through text-[#777777]">AED {productPreview.actualPrice}</p>
                <p className="text-[#C9A14A] font-semibold">AED {productPreview.offerPrice}</p>
              </div>
              <p className="text-[12px] text-[#333333] mt-2">Sizes: {productPreview.sizes}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProductsPage({ isLoadingProducts, savedProducts }) {
  return (
    <div className="rounded-2xl border border-[#C9A14A]/20 p-4 sm:p-5">
      <p className="text-[12px] tracking-[0.14em] uppercase text-[#C9A14A] mb-3 font-semibold">Saved Products</p>
      {isLoadingProducts ? (
        <p className="text-[12px] text-[#777777]">Loading saved products...</p>
      ) : !savedProducts.length ? (
        <p className="text-[12px] text-[#777777]">No products saved yet.</p>
      ) : (
        <div className="space-y-3 max-h-[560px] overflow-auto pr-1">
          {savedProducts.map((product) => (
            <div key={product.id} className="rounded-xl border border-[#C9A14A]/20 p-3">
              <p className="text-[13px] font-semibold text-[#0A0A0A]">{product.name}</p>
              <p className="text-[11px] text-[#666666] mt-1">{product.description}</p>
              <p className="text-[11px] text-[#C9A14A] mt-1">
                AED {product.offerPrice} / <span className="line-through text-[#999999]">{product.actualPrice}</span>
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function AdminPage({ onUnauthorized, onProductSaved, onOrdersClick }) {
  const navigate = useNavigate();
  const [isCheckingAccess, setIsCheckingAccess] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [saveSuccess, setSaveSuccess] = useState("");
  const [savedProducts, setSavedProducts] = useState([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);

  const [productName, setProductName] = useState("");
  const [productDescription, setProductDescription] = useState("");
  const [actualPrice, setActualPrice] = useState("");
  const [offerPrice, setOfferPrice] = useState("");
  const [selectedSizes, setSelectedSizes] = useState([]);
  const [uploadedImages, setUploadedImages] = useState([]);
  const [colorImageMap, setColorImageMap] = useState({});

  useEffect(() => {
    return () => {
      uploadedImages.forEach((fileMeta) => window.URL.revokeObjectURL(fileMeta.previewUrl));
    };
  }, [uploadedImages]);

  useEffect(() => {
    let mounted = true;

    const loadSavedProducts = async () => {
      setIsLoadingProducts(true);
      try {
        const response = await fetchAdminProducts();
        if (mounted) {
          setSavedProducts(response.products || []);
        }
      } catch {
        if (mounted) {
          setSavedProducts([]);
        }
      } finally {
        if (mounted) {
          setIsLoadingProducts(false);
        }
      }
    };

    const verifyAccess = async () => {
      try {
        await validateAdminSession();
        if (mounted) {
          setIsCheckingAccess(false);
          loadSavedProducts();
        }
      } catch {
        if (mounted) {
          onUnauthorized?.();
        }
      }
    };

    verifyAccess();
    return () => {
      mounted = false;
    };
  }, [onUnauthorized]);

  const handleImageUpload = (event) => {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;

    const nextFiles = files.map((file, index) => ({
      id: `${Date.now()}-${index}`,
      fileName: file.name,
      previewUrl: window.URL.createObjectURL(file),
    }));

    setUploadedImages((current) => [...current, ...nextFiles]);
  };

  const toggleSize = (size) => {
    setSelectedSizes((current) =>
      current.includes(size) ? current.filter((value) => value !== size) : [...current, size]
    );
  };

  const resetProductForm = () => {
    uploadedImages.forEach((fileMeta) => window.URL.revokeObjectURL(fileMeta.previewUrl));
    setProductName("");
    setProductDescription("");
    setActualPrice("");
    setOfferPrice("");
    setSelectedSizes([]);
    setUploadedImages([]);
    setColorImageMap({});
  };

  const handleSaveProduct = async () => {
    if (isSaving) return;
    setSaveError("");
    setSaveSuccess("");

    const imageById = Object.fromEntries(uploadedImages.map((img) => [img.id, img.fileName]));
    const resolvedColorImageMap = Object.fromEntries(
      Object.entries(colorImageMap)
        .filter(([, imageId]) => imageById[imageId])
        .map(([color, imageId]) => [color, imageById[imageId]])
    );

    setIsSaving(true);
    try {
      await createAdminProduct({
        name: productName.trim(),
        description: productDescription.trim(),
        actualPrice: Number(actualPrice),
        offerPrice: Number(offerPrice),
        sizes: selectedSizes,
        images: uploadedImages.map((img) => img.fileName),
        colorImageMap: resolvedColorImageMap,
      });
      setSaveSuccess("Product saved to database successfully.");
      resetProductForm();
      const refreshed = await fetchAdminProducts();
      setSavedProducts(refreshed.products || []);
      onProductSaved?.();
    } catch (error) {
      setSaveError(error.message || "Unable to save product.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isCheckingAccess) {
    return (
      <section className="max-w-md mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
        <div className="rounded-3xl border border-[#C9A14A]/25 p-5 sm:p-6 bg-white">
          <h1 className="text-3xl text-[#0A0A0A] mb-2" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
            Verifying Access
          </h1>
          <p className="text-[13px] text-[#555555]">Checking secure admin session...</p>
        </div>
      </section>
    );
  }

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-8 sm:py-10 lg:py-12">
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl text-[#0A0A0A]" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
          Admin Panel
        </h1>
        <p className="text-[13px] sm:text-[14px] text-[#555555] mt-2">Manage products, uploads, and orders from here.</p>
      </div>

      <div className="mb-6 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => navigate("/admin/products")}
          className="rounded-full bg-[#0A0A0A] hover:bg-[#222222] text-white px-5 py-2.5 text-[11px] tracking-[0.12em] uppercase font-semibold"
        >
          Products
        </button>
        <button
          type="button"
          onClick={onOrdersClick}
          className="rounded-full border border-[#C9A14A]/40 hover:border-[#C9A14A] text-[#0A0A0A] px-5 py-2.5 text-[11px] tracking-[0.12em] uppercase font-semibold"
        >
          Orders
        </button>
        <button
          type="button"
          onClick={() => navigate("/admin/upload")}
          className="rounded-full bg-[#C9A14A] hover:bg-[#E8C97A] text-[#0A0A0A] px-5 py-2.5 text-[11px] tracking-[0.12em] uppercase font-semibold"
        >
          Upload Product
        </button>
      </div>

      <Routes>
        <Route path="/" element={<Navigate to="/admin/products" replace />} />
        <Route path="products" element={<ProductsPage isLoadingProducts={isLoadingProducts} savedProducts={savedProducts} />} />
        <Route
          path="upload"
          element={
            <UploadProductPage
              productName={productName}
              productDescription={productDescription}
              actualPrice={actualPrice}
              offerPrice={offerPrice}
              selectedSizes={selectedSizes}
              uploadedImages={uploadedImages}
              colorImageMap={colorImageMap}
              saveError={saveError}
              saveSuccess={saveSuccess}
              isSaving={isSaving}
              onProductNameChange={setProductName}
              onDescriptionChange={setProductDescription}
              onActualPriceChange={setActualPrice}
              onOfferPriceChange={setOfferPrice}
              onImageUpload={handleImageUpload}
              onToggleSize={toggleSize}
              onSave={handleSaveProduct}
              onColorMapChange={(color, imageId) =>
                setColorImageMap((current) => ({
                  ...current,
                  [color]: imageId,
                }))
              }
            />
          }
        />
        <Route path="*" element={<Navigate to="/admin/products" replace />} />
      </Routes>
    </section>
  );
}
