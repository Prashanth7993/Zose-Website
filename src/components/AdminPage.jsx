import { useEffect, useMemo, useState } from "react";
import { Navigate, Route, Routes, useNavigate } from "react-router-dom";
import {
  createAdminProduct,
  deleteAdminProduct,
  fetchAdminProducts,
  updateAdminProduct,
  uploadAdminImages,
  validateAdminSession,
} from "../lib/auth";

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
  isSaving,
  productDescription,
  productName,
  saveError,
  saveSuccess,
  selectedSizes,
  uploadedImages,
  onActualPriceChange,
  onDescriptionChange,
  onImageColorChange,
  onImageUpload,
  onOfferPriceChange,
  onProductNameChange,
  onSave,
  onToggleSize,
}) {
  const [previewIndex, setPreviewIndex] = useState(0);

  useEffect(() => {
    if (!uploadedImages.length) {
      setPreviewIndex(0);
      return;
    }
    setPreviewIndex((current) => Math.min(current, uploadedImages.length - 1));
  }, [uploadedImages]);

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
            <div className="mt-4 space-y-3">
              <div className="relative rounded-xl border border-[#C9A14A]/20 p-2">
                <img src={uploadedImages[previewIndex]?.previewUrl} alt="Selected preview" className="w-full h-44 object-contain bg-[#f8f8f8] rounded-lg" />
                {uploadedImages.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={() => setPreviewIndex((current) => (current - 1 + uploadedImages.length) % uploadedImages.length)}
                      className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/90 border border-[#C9A14A]/30 h-8 w-8 text-[#333333]"
                    >
                      ‹
                    </button>
                    <button
                      type="button"
                      onClick={() => setPreviewIndex((current) => (current + 1) % uploadedImages.length)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/90 border border-[#C9A14A]/30 h-8 w-8 text-[#333333]"
                    >
                      ›
                    </button>
                  </>
                )}
              </div>
              <p className="text-[10px] text-[#555555] truncate">{uploadedImages[previewIndex]?.fileName}</p>
              <div className="flex flex-wrap gap-2">
                {uploadedImages.map((image, index) => (
                  <button
                    key={image.id}
                    type="button"
                    onClick={() => setPreviewIndex(index)}
                    className={`h-12 w-12 rounded-md overflow-hidden border ${index === previewIndex ? "border-[#C9A14A]" : "border-[#C9A14A]/30"}`}
                  >
                    <img src={image.previewUrl} alt={image.fileName} className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-[#C9A14A]/20 p-4 sm:p-5">
          <p className="text-[12px] tracking-[0.14em] uppercase text-[#C9A14A] mb-3 font-semibold">Assign Color for Each Uploaded Image</p>
          {!uploadedImages.length ? (
            <p className="text-[12px] text-[#666666]">Upload images first, then choose a color for each image.</p>
          ) : (
            <div className="space-y-2">
              {uploadedImages.map((image) => (
                <div key={`assign-${image.id}`} className="grid grid-cols-[1fr_auto] items-center gap-3 rounded-xl border border-[#C9A14A]/20 p-2.5">
                  <p className="text-[12px] text-[#333333] truncate">{image.fileName}</p>
                  <select
                    value={image.color || ""}
                    onChange={(event) => onImageColorChange(image.id, event.target.value)}
                    className="min-w-[150px] border border-[#C9A14A]/30 rounded-lg px-2.5 py-1.5 text-[12px] outline-none focus:border-[#C9A14A]"
                  >
                    <option value="">Select color</option>
                    {colorOptions.map((color) => (
                      <option key={`${image.id}-${color}`} value={color}>
                        {color}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          )}
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
              {uploadedImages[previewIndex] ? (
                <div className="h-full relative">
                  <img src={uploadedImages[previewIndex].previewUrl} alt="Preview" className="h-full w-full object-contain" />
                  {uploadedImages.length > 1 && (
                    <>
                      <button
                        type="button"
                        onClick={() => setPreviewIndex((current) => (current - 1 + uploadedImages.length) % uploadedImages.length)}
                        className="absolute left-1 top-1/2 -translate-y-1/2 rounded-full bg-white/90 border border-[#C9A14A]/30 h-8 w-8 text-[#333333]"
                      >
                        ‹
                      </button>
                      <button
                        type="button"
                        onClick={() => setPreviewIndex((current) => (current + 1) % uploadedImages.length)}
                        className="absolute right-1 top-1/2 -translate-y-1/2 rounded-full bg-white/90 border border-[#C9A14A]/30 h-8 w-8 text-[#333333]"
                      >
                        ›
                      </button>
                    </>
                  )}
                </div>
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

function ProductsPage({
  editDraft,
  editingProductId,
  deletingProductId,
  isLoadingProducts,
  isUpdatingProduct,
  savedProducts,
  onEditCancel,
  onEditChange,
  onDeleteProduct,
  onEditSave,
  onEditStart,
  onViewProduct,
}) {
  const resolveImageSrc = (image) => {
    if (!image) return "";
    if (/^(https?:|data:|blob:|\/)/i.test(image)) return image;
    return `https://zose-backend.onrender.com/uploads/${encodeURIComponent(image)}`;
  };

  return (
    <div className="rounded-2xl border border-[#C9A14A]/20 p-4 sm:p-5">
      <p className="text-[12px] tracking-[0.14em] uppercase text-[#C9A14A] mb-4 font-semibold">Saved Products</p>
      {isLoadingProducts ? (
        <p className="text-[12px] text-[#777777]">Loading saved products...</p>
      ) : !savedProducts.length ? (
        <p className="text-[12px] text-[#777777]">No products saved yet.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5 sm:gap-6">
          {savedProducts.map((product) => (
            <div key={product.id} className="rounded-xl border border-[#C9A14A]/20 overflow-hidden">
              <img
                    src={resolveImageSrc(product.images?.[0])}
                    alt={product.name}
                    className="w-full h-52 object-cover bg-[#f2f2f2]"
              />
              {editingProductId === product.id ? (
                <div className="p-4 space-y-3">
                  <input
                    type="text"
                    value={editDraft.name}
                    onChange={(event) => onEditChange("name", event.target.value)}
                    placeholder="Product Name"
                    className="w-full border border-[#C9A14A]/30 rounded-md px-3 py-2 text-[13px]"
                  />
                  <textarea
                    rows={3}
                    value={editDraft.description}
                    onChange={(event) => onEditChange("description", event.target.value)}
                    placeholder="Product Description"
                    className="w-full border border-[#C9A14A]/30 rounded-md px-3 py-2 text-[13px] resize-none"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="number"
                      min="0"
                      value={editDraft.actualPrice}
                      onChange={(event) => onEditChange("actualPrice", event.target.value)}
                      placeholder="Actual Price"
                      className="border border-[#C9A14A]/30 rounded-md px-3 py-2 text-[13px]"
                    />
                    <input
                      type="number"
                      min="0"
                      value={editDraft.offerPrice}
                      onChange={(event) => onEditChange("offerPrice", event.target.value)}
                      placeholder="Offer Price"
                      className="border border-[#C9A14A]/30 rounded-md px-3 py-2 text-[13px]"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={onEditSave}
                      disabled={isUpdatingProduct}
                      className="flex-1 rounded-full bg-[#0A0A0A] text-white px-3 py-2 text-[11px] uppercase tracking-[0.1em] disabled:opacity-60"
                    >
                      {isUpdatingProduct ? "Saving..." : "Save"}
                    </button>
                    <button
                      type="button"
                      onClick={onEditCancel}
                      className="flex-1 rounded-full border border-[#C9A14A]/40 text-[#333333] px-3 py-2 text-[11px] uppercase tracking-[0.1em]"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  
                  <div className="p-4 space-y-3">
                    <div>
                      <h3 className="text-xl text-[#0A0A0A] font-semibold">{product.name}</h3>
                      <p className="text-[13px] text-[#666666] mt-1 line-clamp-2">{product.description}</p>
                    </div>
                    <p className="text-[13px] text-[#C9A14A] font-semibold">
                      AED {product.offerPrice} / <span className="line-through text-[#999999]">{product.actualPrice}</span>
                    </p>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => onViewProduct(product)}
                        className="flex-1 rounded-full bg-[#0A0A0A] text-white px-3 py-2 text-[11px] uppercase tracking-[0.1em]"
                      >
                        View
                      </button>
                      <button
                        type="button"
                        onClick={() => onEditStart(product)}
                        className="flex-1 rounded-full border border-[#C9A14A]/40 text-[#333333] px-3 py-2 text-[11px] uppercase tracking-[0.1em]"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => onDeleteProduct(product)}
                        disabled={deletingProductId === product.id}
                        className="flex-1 rounded-full border border-red-500/40 text-red-600 px-3 py-2 text-[11px] uppercase tracking-[0.1em] disabled:opacity-60"
                      >
                        {deletingProductId === product.id ? "Deleting..." : "Delete"}
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// function ProductsPage({
//   editDraft,
//   editingProductId,
//   deletingProductId,
//   isLoadingProducts,
//   isUpdatingProduct,
//   savedProducts,
//   onEditCancel,
//   onEditChange,
//   onDeleteProduct,
//   onEditSave,
//   onEditStart,
//   onViewProduct,
// }) {
//   const resolveImageSrc = (image) => {
//     if (!image) return "";
//     if (/^(https?:|data:|blob:|\/)/i.test(image)) return image;
//     return `/uploads/${encodeURIComponent(image)}`;
//   };

//   return (
//     <div className="rounded-2xl border border-[#C9A14A]/20 p-4 sm:p-5">
//       <p className="text-[12px] tracking-[0.14em] uppercase text-[#C9A14A] mb-3 font-semibold">Saved Products</p>
//       {isLoadingProducts ? (
//         <p className="text-[12px] text-[#777777]">Loading saved products...</p>
//       ) : !savedProducts.length ? (
//         <p className="text-[12px] text-[#777777]">No products saved yet.</p>
//       ) : (
//         <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 max-h-[620px] overflow-auto pr-1">
//           {savedProducts.map((product) => (
//             <div key={product.id} className="rounded-xl border border-[#C9A14A]/20 p-3">
//               <div className="flex gap-3">
//                 <img
//                   src={resolveImageSrc(product.images?.[0])}
//                   alt={product.name}
//                   className="w-20 h-20 rounded-lg object-cover bg-[#f2f2f2] shrink-0"
//                 />
//                 <div className="min-w-0 flex-1">
//                   {editingProductId === product.id ? (
//                     <div className="space-y-1.5">
//                       <input
//                         type="text"
//                         value={editDraft.name}
//                         onChange={(event) => onEditChange("name", event.target.value)}
//                         className="w-full border border-[#C9A14A]/30 rounded-md px-2 py-1 text-[11px]"
//                       />
//                       <textarea
//                         rows={2}
//                         value={editDraft.description}
//                         onChange={(event) => onEditChange("description", event.target.value)}
//                         className="w-full border border-[#C9A14A]/30 rounded-md px-2 py-1 text-[11px] resize-none"
//                       />
//                       <div className="grid grid-cols-2 gap-1.5">
//                         <input
//                           type="number"
//                           min="0"
//                           value={editDraft.actualPrice}
//                           onChange={(event) => onEditChange("actualPrice", event.target.value)}
//                           className="border border-[#C9A14A]/30 rounded-md px-2 py-1 text-[11px]"
//                         />
//                         <input
//                           type="number"
//                           min="0"
//                           value={editDraft.offerPrice}
//                           onChange={(event) => onEditChange("offerPrice", event.target.value)}
//                           className="border border-[#C9A14A]/30 rounded-md px-2 py-1 text-[11px]"
//                         />
//                       </div>
//                     </div>
//                   ) : (
//                     <>
//                       <p className="text-[12px] font-semibold text-[#0A0A0A] truncate">{product.name}</p>
//                       <p className="text-[10px] text-[#666666] mt-0.5 line-clamp-2">{product.description}</p>
//                       <p className="text-[10px] text-[#C9A14A] mt-1">
//                         AED {product.offerPrice} / <span className="line-through text-[#999999]">{product.actualPrice}</span>
//                       </p>
//                     </>
//                   )}
//                 </div>
//               </div>
//               <div className="mt-2 flex gap-2">
//                 {editingProductId === product.id ? (
//                   <>
//                     <button
//                       type="button"
//                       onClick={onEditSave}
//                       disabled={isUpdatingProduct}
//                       className="rounded-full bg-[#0A0A0A] text-white px-3 py-1 text-[10px] uppercase tracking-[0.1em] disabled:opacity-60"
//                     >
//                       {isUpdatingProduct ? "Saving..." : "Save"}
//                     </button>
//                     <button
//                       type="button"
//                       onClick={onEditCancel}
//                       className="rounded-full border border-[#C9A14A]/40 text-[#333333] px-3 py-1 text-[10px] uppercase tracking-[0.1em]"
//                     >
//                       Cancel
//                     </button>
//                   </>
//                 ) : (
//                   <>
//                     <button
//                       type="button"
//                       onClick={() => onViewProduct(product)}
//                       className="rounded-full bg-[#0A0A0A] text-white px-3 py-1 text-[10px] uppercase tracking-[0.1em]"
//                     >
//                       View
//                     </button>
//                     <button
//                       type="button"
//                       onClick={() => onDeleteProduct(product)}
//                       disabled={deletingProductId === product.id}
//                       className="rounded-full border border-red-500/40 text-red-600 px-3 py-1 text-[10px] uppercase tracking-[0.1em] disabled:opacity-60"
//                     >
//                       {deletingProductId === product.id ? "Deleting..." : "Delete"}
//                     </button>
//                     <button
//                       type="button"
//                       onClick={() => onEditStart(product)}
//                       className="rounded-full border border-[#C9A14A]/40 text-[#333333] px-3 py-1 text-[10px] uppercase tracking-[0.1em]"
//                     >
//                       Edit
//                     </button>
//                   </>
//                 )}
//               </div>
//             </div>
//           ))}
//         </div>
//       )}
//     </div>
//   );
// }

export default function AdminPage({ onUnauthorized, onProductSaved }) {
  const navigate = useNavigate();
  const resolveImageSrc = (image) => {
    if (!image) return "";
    if (/^(https?:|data:|blob:|\/)/i.test(image)) return image;
    return `/uploads/${encodeURIComponent(image)}`;
  };
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
  const [editingProductId, setEditingProductId] = useState(null);
  const [isUpdatingProduct, setIsUpdatingProduct] = useState(false);
  const [deletingProductId, setDeletingProductId] = useState(null);
  const [editDraft, setEditDraft] = useState({
    name: "",
    description: "",
    actualPrice: "",
    offerPrice: "",
  });
  const [viewProduct, setViewProduct] = useState(null);
  const [viewImageIndex, setViewImageIndex] = useState(0);
  const [viewTransitionDirection, setViewTransitionDirection] = useState("left");

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
    setSaveError("");

    const uploadFiles = async () => {
      try {
        const response = await uploadAdminImages(files);
        const nextFiles = (response.files || []).map((file, index) => ({
          id: `${Date.now()}-${index}`,
          fileName: file.fileName,
          previewUrl: file.url,
          imageRef: file.url,
          color: "",
        }));
        setUploadedImages((current) => [...current, ...nextFiles]);
      } catch (error) {
        setSaveError(error.message || "Unable to upload images.");
      }
    };

    uploadFiles();
    event.target.value = "";
  };

  const toggleSize = (size) => {
    setSelectedSizes((current) =>
      current.includes(size) ? current.filter((value) => value !== size) : [...current, size]
    );
  };

  const handleImageColorChange = (imageId, color) => {
    setUploadedImages((current) =>
      current.map((image) => (image.id === imageId ? { ...image, color } : image))
    );
  };

  const resetProductForm = () => {
    setProductName("");
    setProductDescription("");
    setActualPrice("");
    setOfferPrice("");
    setSelectedSizes([]);
    setUploadedImages([]);
  };

  const handleSaveProduct = async () => {
    if (isSaving) return;
    setSaveError("");
    setSaveSuccess("");

    const resolvedColorImageMap = uploadedImages.reduce((accumulator, image) => {
      if (!image.color) return accumulator;
      if (!accumulator[image.color]) {
        accumulator[image.color] = [];
      }
      accumulator[image.color].push(image.imageRef || image.previewUrl);
      return accumulator;
    }, {});

    setIsSaving(true);
    try {
      await createAdminProduct({
        name: productName.trim(),
        description: productDescription.trim(),
        actualPrice: Number(actualPrice),
        offerPrice: Number(offerPrice),
        sizes: selectedSizes,
        images: uploadedImages.map((img) => img.imageRef || img.previewUrl),
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

  const handleStartEditProduct = (product) => {
    setEditingProductId(product.id);
    setEditDraft({
      name: product.name || "",
      description: product.description || "",
      actualPrice: String(product.actualPrice ?? ""),
      offerPrice: String(product.offerPrice ?? ""),
    });
  };

  const handleSaveEditProduct = async () => {
    if (!editingProductId || isUpdatingProduct) return;
    setIsUpdatingProduct(true);
    setSaveError("");
    try {
      const existing = savedProducts.find((product) => product.id === editingProductId);
      if (!existing) throw new Error("Product not found.");

      await updateAdminProduct(editingProductId, {
        name: editDraft.name.trim(),
        description: editDraft.description.trim(),
        actualPrice: Number(editDraft.actualPrice),
        offerPrice: Number(editDraft.offerPrice),
        sizes: existing.sizes || [],
        images: existing.images || [],
        colorImageMap: existing.colorImageMap || {},
      });

      const refreshed = await fetchAdminProducts();
      setSavedProducts(refreshed.products || []);
      setEditingProductId(null);
    } catch (error) {
      setSaveError(error.message || "Unable to update product.");
    } finally {
      setIsUpdatingProduct(false);
    }
  };

  const handleDeleteProduct = async (product) => {
    if (!product?.id || deletingProductId) return;
    const confirmed = window.confirm(`Delete "${product.name}" permanently?`);
    if (!confirmed) return;

    setSaveError("");
    setSaveSuccess("");
    setDeletingProductId(product.id);
    try {
      await deleteAdminProduct(product.id);
      setSavedProducts((current) => current.filter((item) => item.id !== product.id));
      setSaveSuccess("Product deleted successfully.");
      if (viewProduct?.id === product.id) {
        setViewProduct(null);
      }
    } catch (error) {
      setSaveError(error.message || "Unable to delete product.");
    } finally {
      setDeletingProductId(null);
    }
  };

  const handleViewProduct = (product) => {
    setViewProduct(product);
    setViewImageIndex(0);
    setViewTransitionDirection("left");
  };

  const handleViewImageChange = (direction) => {
    const images = Array.isArray(viewProduct?.images) ? viewProduct.images : [];
    if (images.length <= 1) return;
    setViewTransitionDirection(direction);
    setViewImageIndex((current) => {
      if (direction === "right") {
        return (current - 1 + images.length) % images.length;
      }
      return (current + 1) % images.length;
    });
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
        {/* <button
          type="button"
          onClick={onOrdersClick}
          className="rounded-full border border-[#C9A14A]/40 hover:border-[#C9A14A] text-[#0A0A0A] px-5 py-2.5 text-[11px] tracking-[0.12em] uppercase font-semibold"
        >
          Orders
        </button> */}
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
        <Route
          path="products"
          element={
            <ProductsPage
              isLoadingProducts={isLoadingProducts}
              savedProducts={savedProducts}
              editingProductId={editingProductId}
              deletingProductId={deletingProductId}
              editDraft={editDraft}
              isUpdatingProduct={isUpdatingProduct}
              onEditStart={handleStartEditProduct}
              onEditCancel={() => setEditingProductId(null)}
              onViewProduct={handleViewProduct}
              onDeleteProduct={handleDeleteProduct}
              onEditChange={(field, value) =>
                setEditDraft((current) => ({
                  ...current,
                  [field]: value,
                }))
              }
              onEditSave={handleSaveEditProduct}
            />
          }
        />
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
              saveError={saveError}
              saveSuccess={saveSuccess}
              isSaving={isSaving}
              onProductNameChange={setProductName}
              onDescriptionChange={setProductDescription}
              onActualPriceChange={setActualPrice}
              onOfferPriceChange={setOfferPrice}
              onImageUpload={handleImageUpload}
              onImageColorChange={handleImageColorChange}
              onToggleSize={toggleSize}
              onSave={handleSaveProduct}
            />
          }
        />
        <Route path="*" element={<Navigate to="/admin/products" replace />} />
      </Routes>

      {viewProduct && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <style>
            {`
              @keyframes slide-in-right {
                from { transform: translateX(100%); opacity: 0.55; }
                to { transform: translateX(0); opacity: 1; }
              }
              @keyframes slide-in-left {
                from { transform: translateX(-100%); opacity: 0.55; }
                to { transform: translateX(0); opacity: 1; }
              }
            `}
          </style>
          <div className="w-full max-w-2xl rounded-2xl bg-white border border-[#C9A14A]/30 shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-[#C9A14A]/20">
              <h3 className="text-xl text-[#0A0A0A]" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                {viewProduct.name}
              </h3>
              <button onClick={() => setViewProduct(null)} className="text-lg text-[#333333]" aria-label="Close">
                ×
              </button>
            </div>
            <div className="p-4 grid grid-cols-1 md:grid-cols-[260px_1fr] gap-4">
              <div className="space-y-2">
                <div className="relative w-full h-56 overflow-hidden rounded-xl bg-[#f3f3f3]">
                  <img
                    key={`${viewProduct.id}-${viewImageIndex}`}
                    src={resolveImageSrc(viewProduct.images?.[viewImageIndex])}
                    alt={viewProduct.name}
                    className="w-full h-56 object-cover"
                    style={{
                      animation: viewTransitionDirection === "right"
                        ? "slide-in-left 260ms ease"
                        : "slide-in-right 260ms ease",
                    }}
                  />
                  {(viewProduct.images || []).length > 1 && (
                    <>
                      <button
                        type="button"
                        onClick={() => handleViewImageChange("right")}
                        className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-white/85 border border-[#C9A14A]/30 h-8 w-8 text-[#333333]"
                        aria-label="Previous image"
                      >
                        ‹
                      </button>
                      <button
                        type="button"
                        onClick={() => handleViewImageChange("left")}
                        className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-white/85 border border-[#C9A14A]/30 h-8 w-8 text-[#333333]"
                        aria-label="Next image"
                      >
                        ›
                      </button>
                    </>
                  )}
                </div>
                {(viewProduct.images || []).length > 1 && (
                  <div className="flex gap-2 overflow-x-auto">
                    {(viewProduct.images || []).map((image, index) => (
                      <button
                        key={`${viewProduct.id}-thumb-${index}`}
                        type="button"
                        onClick={() => {
                          setViewTransitionDirection(index < viewImageIndex ? "right" : "left");
                          setViewImageIndex(index);
                        }}
                        className={`h-12 w-12 rounded-md overflow-hidden border shrink-0 ${
                          viewImageIndex === index ? "border-[#C9A14A]" : "border-[#C9A14A]/30"
                        }`}
                        aria-label={`View image ${index + 1}`}
                      >
                        <img src={resolveImageSrc(image)} alt={`${viewProduct.name} thumbnail ${index + 1}`} className="h-full w-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <p className="text-[13px] text-[#555555]">{viewProduct.description}</p>
                <p className="text-[12px] text-[#333333]">Sizes: {(viewProduct.sizes || []).join(", ") || "N/A"}</p>
                <p className="text-[12px] text-[#333333]">
                  Colors: {Object.keys(viewProduct.colorImageMap || {}).join(", ") || "N/A"}
                </p>
                <p className="text-[12px] text-[#C9A14A]">
                  AED {viewProduct.offerPrice} / <span className="line-through text-[#999999]">{viewProduct.actualPrice}</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
