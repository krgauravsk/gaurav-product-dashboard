"use client";
import { useEffect, useState } from "react";
import { useProductStore } from "../store/productStore";
import axios from "axios";
import Link from "next/link";
import styles from "./Home.module.css";

import { DatePicker, Select, Button, Spin } from "antd";
const { RangePicker } = DatePicker;
const { Option } = Select;

export default function Home() {
  const { products, setProducts, removeProduct } = useProductStore();
  const [status, setStatus] = useState("");
  const [dateRange, setDateRange] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchFilteredProducts = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();

        if (status) params.append("status", status);
        if (dateRange.length === 2) {
          params.append("startDate", dateRange[0].format("YYYY-MM-DD"));
          params.append("endDate", dateRange[1].format("YYYY-MM-DD"));
        }

        const res = await axios.get(`/api/products?${params.toString()}`);
        setProducts(res.data);
      } catch (error) {
        alert("❌ Failed to load products");
      } finally {
        setLoading(false);
      }
    };

    fetchFilteredProducts();
  }, [status, dateRange, setProducts]);

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this product?")) return;

    try {
      await axios.delete(`/api/products/${id}`);
      removeProduct(id);
    } catch (err) {
      alert("❌ Failed to delete product");
    }
  };

  return (
    <div className={styles.dashboardContainer}>
      <div className={styles.header}>
        <h1>Product Management Dashboard</h1>
      </div>

      {/*  Filter Section */}
      <div className={styles.fiterButtonContainer}>
        <div
          style={{
            marginBottom: "2rem",
            display: "flex",
            gap: "1rem",
            flexWrap: "wrap",
          }}
        >
          <Select
            placeholder="Filter by Status"
            value={status || undefined}
            onChange={(value) => setStatus(value)}
            allowClear
            style={{ minWidth: 180 }}
          >
            <Option value="active">Active</Option>
            <Option value="inactive">Inactive</Option>
          </Select>

          <RangePicker
            value={dateRange}
            onChange={(dates) => setDateRange(dates || [])}
            format="YYYY-MM-DD"
          />
        </div>
        <Link href="/add" passHref>
          <Button type="primary" className={styles.addButton}>
            ➕ Add Product
          </Button>
        </Link>
      </div>

      {/*  Product List with Loader */}
      <Spin spinning={loading} tip="Loading...">
        <div className={styles.productList}>
          {products.map((p) => (
            <div key={p._id} className={styles.productCard}>
              {p.imageUrl && (
                <img
                  src={p.imageUrl}
                  alt={p.title}
                  className={styles.productImage}
                />
              )}
              <div className={styles.productInfo}>
                <h3  className={styles.productTitle}>{p.title}</h3>
                <p className={styles.description}>{p.description}</p>
                <p>
                  <strong>Status:</strong> {p.status}
                </p>
                <p>
                  <strong>Date:</strong>{" "}
                  {new Date(p.date).toLocaleDateString()}
                </p>
              </div>
              <div className={styles.actions}>
                <Link href={`/edit/${p._id}`}>✏️ Edit</Link>
                <button onClick={() => handleDelete(p._id)}>🗑️ Delete</button>
              </div>
            </div>
          ))}
        </div>
      </Spin>
    </div>
  );
}
