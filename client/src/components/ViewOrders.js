import React, { useState } from 'react';
import OrderItemCard from './carditems/OrderItemCard';
import '../css/ViewOrders.css';

const initialOrders = [
  { 
    id: "001", 
    status: "pending", 
    currentLocation: "Nairobi, Kenya",
    destination: "Mombasa, Kenya"
  },
  { 
    id: "002", 
    status: "delivered", 
    currentLocation: "Kisumu, Kenya",
    destination: "Nakuru, Kenya"
  },
  { 
    id: "003", 
    status: "pending", 
    currentLocation: "Eldoret, Kenya",
    destination: "Nairobi, Kenya"
  },
];

function ViewOrders() {
  const [orders, setOrders] = useState(initialOrders);

  const handleCancelOrder = (id) => {
    setOrders(orders.filter(order => order.id !== id));
  };

  const handleUpdateDestination = (id, newDestination) => {
    setOrders(orders.map(order => 
      order.id === id ? { ...order, destination: newDestination } : order
    ));
  };

  return (
    <div className="view-orders">
      <h2>Your Orders</h2>
      <div className="orders-list">
        {orders.map(order => (
          <OrderItemCard 
            key={order.id}
            order={order}
            onCancel={handleCancelOrder}
            onUpdateDestination={handleUpdateDestination}
          />
        ))}
      </div>
    </div>
  );
}

export default ViewOrders;