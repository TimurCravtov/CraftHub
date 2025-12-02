import { useState } from 'react'
import Header from '../component/Header.jsx'
import { useCart } from '../cartContext.jsx'
import {useAuthApi} from "../context/apiAuthContext.jsx";
import {useNavigate} from "react-router-dom";
import { useSecurity } from '../hooks/useSecurity.js'

export default function Checkout() {
  const { items, subtotal } = useCart()
  const formatted = (n) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n)
  const navigate = useNavigate()
  const {api} = useAuthApi();
  const { sanitizeInput, sanitizeFormData } = useSecurity()
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    town: '',
    streetAddress: '',
    phone: '',
    email: '',
    additionalInfo: ''
  })
  
  const handleChange = (e) => {
    const { name, value } = e.target
    let sanitizedValue = value
    
    // Sanitize based on field type
    if (name === 'firstName' || name === 'lastName' || name === 'town') {
      sanitizedValue = sanitizeInput(value, 'name')
    } else if (name === 'email') {
      sanitizedValue = sanitizeInput(value, 'email')
    } else if (name === 'phone') {
      sanitizedValue = sanitizeInput(value, 'phone')
    } else if (name === 'streetAddress' || name === 'additionalInfo') {
      sanitizedValue = sanitizeInput(value, 'address')
    } else {
      sanitizedValue = sanitizeInput(value, 'text')
    }
    
    setFormData(prev => ({ ...prev, [name]: sanitizedValue }))
  }
  
  const handleOrderButton = async () => {
    try {
      // Sanitize all form data before sending
      const sanitizedData = sanitizeFormData(formData)
      
      // TODO: Send order to server
      // await api.post("/api/orders/create", sanitizedData)
      
      navigate("/")
    } catch (error) {
      console.error('Error placing order:', error)
    }
  }

  return (
    <div className="checkout-page futuristic-page-base">
      <Header />

      <div className="container-2xl two-column-layout two-column-layout--spacious page-content--no-hero">
        <form className="checkout-form">
          <h2 className="checkout-section-title">Billing details</h2>

          <div className="checkout-field">
            <label className="checkout-label">First Name</label>
            <input 
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              className="checkout-input" 
              placeholder="John" 
            />
          </div>

          <div className="checkout-field">
            <label className="checkout-label">Town / City</label>
            <input 
              name="town"
              value={formData.town}
              onChange={handleChange}
              className="checkout-input" 
            />
          </div>

          <div className="checkout-field">
            <label className="checkout-label">Street address</label>
            <input 
              name="streetAddress"
              value={formData.streetAddress}
              onChange={handleChange}
              className="checkout-input" 
            />
          </div>

          <div className="checkout-grid">
            <div className="checkout-field">
              <label className="checkout-label">Phone</label>
              <input 
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
                className="checkout-input" 
              />
            </div>
            <div className="checkout-field">
              <label className="checkout-label">Email address</label>
              <input 
                name="email"
                type="email" 
                value={formData.email}
                onChange={handleChange}
                className="checkout-input" 
              />
            </div>
          </div>

          <div className="checkout-field">
            <label className="checkout-label">Additional information</label>
            <textarea 
              name="additionalInfo"
              value={formData.additionalInfo}
              onChange={handleChange}
              rows={3} 
              className="checkout-textarea" 
            />
          </div>
        </form>

        <div>
          <div className="checkout-summary">
            <h3 className="checkout-summary-title">Product</h3>
            <div className="checkout-summary-list">
              {items.map(it => (
                <div key={it.id} className="checkout-summary-product">
                  <span>{it.title} <span style={{ color: 'rgba(255, 255, 255, 0.7)' }}>x {it.qty}</span></span>
                  <span>{formatted(it.price * it.qty)}</span>
                </div>
              ))}
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


