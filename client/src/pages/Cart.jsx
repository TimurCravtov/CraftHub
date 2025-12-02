import Header from '../component/Header.jsx'
import { useCart } from '../cartContext.jsx'
import { Trash } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function Cart() {
  const { items, updateQty, removeFromCart, subtotal } = useCart()
  const formatted = (n) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n)
  const navigate = useNavigate()
  return (
    <div className="cart-page futuristic-page-base">
      <Header />

      <div className="container-2xl two-column-layout page-content--no-hero">
        <div>
          <div className="cart-table">
            <div className="cart-table-header">
              <div className="cart-item-info">Product</div>
              <div className="cart-item-price">Price</div>
              <div className="cart-item-qty">Quantity</div>
              <div className="cart-item-subtotal">Subtotal</div>
            </div>
            <div className="cart-table-body">
              {items.length === 0 && (
                <div className="cart-empty">Your cart is empty.</div>
              )}
              {items.map((it) => (
                <div key={it.id} className="cart-item-row">
                  <div className="cart-item-info">
                    <div className="cart-item-thumb">
                      <img src={it.imageUrl} alt={it.title} />
                    </div>
                    <div>
                      <div className="cart-item-title">{it.title}</div>
                      <button onClick={() => removeFromCart(it.id)} className="cart-remove">
                        <Trash className="h-3.5 w-3.5" /> Remove
                      </button>
                    </div>
                  </div>
                  <div className="cart-item-price">{formatted(it.price)}</div>
                  <div className="cart-item-qty">
                    <input
                      type="number"
                      min={1}
                      value={it.qty}
                      onChange={(e) => updateQty(it.id, Number(e.target.value))}
                      className="cart-qty-input"
                    />
                  </div>
                  <div className="cart-item-subtotal">{formatted(it.price * it.qty)}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div>
          <div className="cart-summary">
            <h3 className="cart-summary-title">Cart Totals</h3>
            <div className="cart-summary-rows">
              <div className="cart-summary-row">

                
              </div>
              <div className="cart-summary-row">
                <span className="cart-summary-subtitle">Total</span>
                <span className="cart-summary-total">{formatted(subtotal)}</span>
              </div>
            </div>
            <button onClick={() => navigate('/checkout')} className="btn-primary btn-primary--full btn-primary--large cart-checkout">Check Out</button>
          </div>
        </div>
      </div>
    </div>
  )
}


