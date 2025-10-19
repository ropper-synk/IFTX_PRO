import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [product, setProduct] = useState(null);
  const [cartLoading, setCartLoading] = useState(false);

  useEffect(() => {
    const init = async () => {
      try {
        const status = await axios.get("http://localhost:5000/api/auth/status", { withCredentials: true });
        if (!status.data?.authenticated) {
          alert("Please login to continue.");
          navigate("/login");
          return;
        }
        // Fetch or compose product. Placeholder since API is not provided.
        // In a real app, fetch from your products API by id
        setProduct({
          id,
          name: `Product #${id}`,
          description: "High quality item with excellent features.",
          price: 99.99,
          image: "/placeholder.png"
        });
      } catch (err) {
        console.error("Failed to load product:", err);
        setError("Failed to load product");
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [id, navigate]);

  const addToCart = async () => {
    if (!product) return;
    
    setCartLoading(true);
    try {
      const response = await axios.post('http://localhost:5000/api/cart/add', {
        productId: product.id.toString(),
        name: product.name,
        description: product.description,
        price: product.price,
        image: product.image,
        quantity: quantity
      }, {
        withCredentials: true
      });

      if (response.data.success) {
        alert(`Added ${quantity} ${product.name}(s) to cart!`);
      } else {
        alert('Failed to add item to cart');
      }
    } catch (error) {
      console.error('Add to cart error:', error);
      if (error.response?.status === 401) {
        alert('Please login to add items to cart');
        navigate('/login');
      } else {
        alert('Failed to add item to cart');
      }
    } finally {
      setCartLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-600">
        {error || "Product not found"}
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
      <div>
        <img src={product.image} alt={product.name} className="w-full h-80 object-cover rounded" />
      </div>
      <div>
        <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
        <p className="text-gray-600 mb-4">{product.description}</p>
        <div className="text-2xl font-semibold mb-6">${product.price}</div>

        <div className="flex items-center gap-4 mb-6">
          <span className="font-medium">Quantity:</span>
          <div className="flex items-center border rounded">
            <button
              type="button"
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              className="px-3 py-2 hover:bg-gray-100"
            >
              −
            </button>
            <input
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value || "1", 10)))}
              className="w-16 text-center outline-none"
            />
            <button
              type="button"
              onClick={() => setQuantity((q) => q + 1)}
              className="px-3 py-2 hover:bg-gray-100"
            >
              +
            </button>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={addToCart}
            disabled={cartLoading}
            className="bg-blue-600 text-white px-5 py-3 rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {cartLoading ? 'Adding...' : 'Add to Cart'}
          </button>
          <button
            onClick={() => { addToCart(); navigate("/checkout"); }}
            disabled={cartLoading}
            className="bg-green-600 text-white px-5 py-3 rounded hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            Buy Now
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProductDetail;
