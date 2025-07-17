import { generateCompleteInvoiceHTML } from "./invoiceTemplate"

interface InvoiceItem {
  product_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

interface InvoiceBuyer {
  name: string;
  email: string;
  phone: string;
}

interface InvoiceSeller {
  name: string;
  address?: string;
  phone?: string;
  email?: string;
}

interface InvoiceOrder {
  order_number: string;
  created_at: string;
  status: string;
  shipping_address: string;
  payment_method: string;
  payment_status: string;
  subtotal: number;
  tax_amount: number;
  shipping_amount: number;
  discount_amount: number;
  points_used: number;
  total_amount: number;
}

interface InvoiceData {
  order: InvoiceOrder;
  buyer: InvoiceBuyer;
  seller?: InvoiceSeller;
  items: InvoiceItem[];
}

export function generateInvoiceHTML(purchase: InvoiceData) {
  // console.log("Invoice generator received data:", purchase);
  
  // Extract order details
  const order = purchase.order || {};
  const buyer = purchase.buyer || { name: "", email: "", phone: "" };
  const seller = purchase.seller;
  const items = purchase.items || [];
  
  // console.log("Extracted data:", { order, buyer, seller, items });
  
  // Order details
  const orderNumber = order.order_number || "";
  const orderDate = order.created_at ? new Date(order.created_at).toLocaleDateString() : "";
  const status = order.status || "";
  const shippingAddress = order.shipping_address || "";
  const paymentMethod = order.payment_method || "";
  const paymentStatus = order.payment_status || "";
  
  // Financial details
  const subtotal = order.subtotal || 0;
  const taxAmount = order.tax_amount || 0;
  const shippingAmount = order.shipping_amount || 0;
  const discountAmount = order.discount_amount || 0;
  const pointsUsed = order.points_used || 0;
  const totalAmount = order.total_amount || 0;

  // console.log("Processed details:", {
    // orderNumber,
    // orderDate,
    // status,
    // shippingAddress,
    // paymentMethod,
    // paymentStatus,
    // subtotal,
    // taxAmount,
    // shippingAmount,
    // discountAmount,
    // pointsUsed,
    // totalAmount
  // });

  // Items table HTML
  const itemsTableHTML = items.length > 0 ? `
    <table class="items-table">
      <thead>
        <tr>
          <th>Product</th>
          <th>Quantity</th>
          <th>Unit Price</th>
          <th>Total</th>
        </tr>
      </thead>
      <tbody>
        ${items.map((item: InvoiceItem) => `
          <tr>
            <td>${item.product_name}</td>
            <td>${item.quantity}</td>
            <td>₹${item.unit_price.toFixed(2)}</td>
            <td>₹${item.total_price.toFixed(2)}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  ` : '<p>No items in this order</p>';

  // Financial summary table
  const financialSummaryHTML = `
    <table class="financial-summary">
      <tr>
        <td>Subtotal:</td>
        <td>₹${subtotal.toFixed(2)}</td>
      </tr>
      ${taxAmount > 0 ? `
        <tr>
          <td>Tax:</td>
          <td>₹${taxAmount.toFixed(2)}</td>
        </tr>
      ` : ''}
      ${shippingAmount > 0 ? `
        <tr>
          <td>Shipping:</td>
          <td>₹${shippingAmount.toFixed(2)}</td>
        </tr>
      ` : ''}
      ${discountAmount > 0 ? `
        <tr>
          <td>Discount:</td>
          <td>-₹${discountAmount.toFixed(2)}</td>
        </tr>
      ` : ''}
      ${pointsUsed > 0 ? `
        <tr>
          <td>Points Used:</td>
          <td>-₹${pointsUsed.toFixed(2)}</td>
        </tr>
      ` : ''}
      <tr class="total">
        <td>Total:</td>
        <td>₹${totalAmount.toFixed(2)}</td>
      </tr>
    </table>
  `;

  // Generate the content HTML
  const contentHTML = `
        <div class="section">
          <div class="section-title">Order Information</div>
          <div class="user-details">
            <p>
              <strong>Invoice Date:</strong> ${orderDate}
              <span class="status-badge status-${status.toLowerCase()}">${status}</span>
            </p>
            <p><strong>Order Number:</strong> ${orderNumber}</p>
          </div>
        </div>

        <div class="section">
          <div class="section-title">Buyer Information</div>
          <div class="user-details">
            <p><strong>Name:</strong> ${buyer.name}</p>
            <p><strong>Phone:</strong> ${buyer.phone}</p>
          </div>
        </div>

        <div class="section">
          <div class="section-title">Shipping Address</div>
          <div class="user-details">
            <p>${shippingAddress}</p>
          </div>
        </div>

        <div class="section">
          <div class="section-title">Payment Information</div>
          <div class="user-details">
            <p><strong>Payment Method:</strong> ${paymentMethod}</p>
          </div>
        </div>

        <div class="section">
          <div class="section-title">Order Items</div>
          ${itemsTableHTML}
        </div>

        <div class="section">
          <div class="section-title">Financial Summary</div>
          ${financialSummaryHTML}
        </div>
  `;

  return generateCompleteInvoiceHTML(`Invoice #${orderNumber}`, contentHTML, seller);
}

export function generateRewardInvoiceHTML(purchase: InvoiceData) {
  // console.log("Reward Invoice generator received data:", purchase);
  
  // Extract order details
  const order = purchase.order || {};
  const buyer = purchase.buyer || { name: "", email: "", phone: "" };
  const seller = purchase.seller;
  const items = purchase.items || [];
  
  // console.log("Extracted data:", { order, buyer, seller, items });
  
  // Order details
  const orderNumber = order.order_number || "";
  const orderDate = order.created_at ? new Date(order.created_at).toLocaleDateString() : "";
  const status = order.status || "";
  const shippingAddress = order.shipping_address || "";
  const paymentMethod = order.payment_method || "";
  const paymentStatus = order.payment_status || "";
  
  // Financial details
  const subtotal = order.subtotal || 0;
  const taxAmount = order.tax_amount || 0;
  const shippingAmount = order.shipping_amount || 0;
  const discountAmount = order.discount_amount || 0;
  const pointsUsed = order.points_used || 0;
  const totalAmount = order.total_amount || 0;

  // console.log("Processed details:", {
    // orderNumber,
    // orderDate,
    // status,
    // shippingAddress,
    // paymentMethod,
    // paymentStatus,
    // subtotal,
    // taxAmount,
    // shippingAmount,
    // discountAmount,
    // pointsUsed,
    // totalAmount
  // });

  // Items table HTML for rewards (showing points)
  const itemsTableHTML = items.length > 0 ? `
    <table class="items-table">
      <thead>
        <tr>
          <th>Product</th>
          <th>Quantity</th>
          <th>Unit Price</th>
          <th>Total</th>
        </tr>
      </thead>
      <tbody>
        ${items.map((item: InvoiceItem) => `
          <tr>
            <td>${item.product_name}</td>
            <td>${item.quantity}</td>
            <td>${item.unit_price} points</td>
            <td>${item.total_price} points</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  ` : '<p>No items in this order</p>';

  // Financial summary table for rewards (showing points)
  const financialSummaryHTML = `
    <table class="financial-summary">
      <tr>
        <td>Subtotal:</td>
        <td>${subtotal} points</td>
      </tr>
      ${taxAmount > 0 ? `
        <tr>
          <td>Tax:</td>
          <td>${taxAmount} points</td>
        </tr>
      ` : ''}
      ${shippingAmount > 0 ? `
        <tr>
          <td>Shipping:</td>
          <td>${shippingAmount} points</td>
        </tr>
      ` : ''}
      ${discountAmount > 0 ? `
        <tr>
          <td>Discount:</td>
          <td>-${discountAmount} points</td>
        </tr>
      ` : ''}
      ${pointsUsed > 0 ? `
        <tr>
          <td>Points Used:</td>
          <td>${pointsUsed} points</td>
        </tr>
      ` : ''}
      <tr class="total">
        <td>Total:</td>
        <td>${totalAmount} points</td>
      </tr>
    </table>
  `;

  // Generate the content HTML
  const contentHTML = `
        <div class="section">
          <div class="section-title">Reward Redemption Information</div>
          <div class="user-details">
            <p>
              <strong>Redemption Date:</strong> ${orderDate}
              <span class="status-badge status-${status.toLowerCase()}">${status}</span>
            </p>
            <p><strong>Redemption Number:</strong> ${orderNumber}</p>
          </div>
        </div>

        <div class="section">
          <div class="section-title">Buyer Information</div>
          <div class="user-details">
            <p><strong>Name:</strong> ${buyer.name}</p>
            <p><strong>Phone:</strong> ${buyer.phone}</p>
          </div>
        </div>

        <div class="section">
          <div class="section-title">Shipping Address</div>
          <div class="user-details">
            <p>${shippingAddress}</p>
          </div>
        </div>

        <div class="section">
          <div class="section-title">Payment Information</div>
          <div class="user-details">
            <p><strong>Payment Method:</strong> ${paymentMethod}</p>
          </div>
        </div>

        <div class="section">
          <div class="section-title">Reward Items</div>
          ${itemsTableHTML}
        </div>

        <div class="section">
          <div class="section-title">Points Summary</div>
          ${financialSummaryHTML}
        </div>
  `;

  return generateCompleteInvoiceHTML(`Reward Redemption #${orderNumber}`, contentHTML, seller);
} 