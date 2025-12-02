import Header from '../component/Header.jsx'
import { useCart } from '../cartContext.jsx'
import {useAuthApi} from "../context/apiAuthContext.jsx";
import {useNavigate} from "react-router-dom";

export default function Checkout() {
  const { items, subtotal } = useCart()
  const formatted = (n) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n)
  const navigate = useNavigate()
  const {api} = useAuthApi();
  const handleOrderButton = () => {
        // items.clear()
      // api.post("/api/orders/create")
      navigate("/")
  }

  return (
    <div className="checkout-page futuristic-page-base">
      <Header />

      <div className="container-2xl two-column-layout two-column-layout--spacious page-content--no-hero">
        <form className="checkout-form">
          <h2 className="checkout-section-title">Billing details</h2>

          <div className="checkout-field">
            <label className="checkout-label">First Name</label>
            <input className="checkout-input" placeholder="John" />
          </div>

          <div className="checkout-field">
            <label className="checkout-label">Town / City</label>
            <input className="checkout-input" />
          </div>

          <div className="checkout-field">
            <label className="checkout-label">Street address</label>
            <input className="checkout-input" />
          </div>

          <div className="checkout-grid">
            <div className="checkout-field">
              <label className="checkout-label">Phone</label>
              <input className="checkout-input" />
            </div>
            <div className="checkout-field">
              <label className="checkout-label">Email address</label>
              <input type="email" className="checkout-input" />
            </div>
          </div>

          <div className="checkout-field">
            <label className="checkout-label">Additional information</label>
            <textarea rows={3} className="checkout-textarea" />
          </div>
        </form>

        <div>
          <div className="checkout-summary">
            <h3 className="checkout-summary-title">Product</h3>
            <div className="checkout-summary-list">
              {items.map(it => (
                <div key={it.id} className="checkout-summary-product">
                  <span>{it.title} <span className="text-slate-400">x {it.qty}</span></span>
                  <span>{formatted(it.price * it.qty)}</span>
                </div>
              ))}
            </div>
            <div className="checkout-summary-row">
              <span className="text-slate-600">Subtotal</span>
              <span>{formatted(subtotal)}</span>
            </div>
            <div className="checkout-summary-row">
              <span className="checkout-summary-total">Total</span>
              <span className="checkout-summary-total">{formatted(subtotal)}</span>
            </div>
            <div className="checkout-payments">
              <label><input type="radio" name="pay" defaultChecked /> Direct Bank Transfer</label>
              <label><input type="radio" name="pay" /> Cash</label>
            </div>
            <button onClick={handleOrderButton} className="btn-primary btn-primary--full btn-primary--large">Place order</button>
          </div>
        </div>
      </div>
    </div>
  )
}


