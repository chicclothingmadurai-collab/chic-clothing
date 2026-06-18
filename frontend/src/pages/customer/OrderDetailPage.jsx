import React from "react";
import { useParams } from "react-router-dom";

const OrderDetailPage = () => {
  const { id } = useParams();

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold">
        Order Details
      </h1>

      <p>Order ID: {id}</p>
    </div>
  );
};

export default OrderDetailPage;
