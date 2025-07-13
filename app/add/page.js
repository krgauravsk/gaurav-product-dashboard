"use client";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useState } from "react";
import styles from "./AddProduct.module.css";

import { Input, Select, DatePicker, Upload, Button, message } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import dayjs from "dayjs";

const { TextArea } = Input;
const { Option } = Select;

const schema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  status: z.enum(["active", "inactive"]),
  date: z.any().refine((val) => !!val, { message: "Date is required" }),
  image: z.any().optional(),
});

export default function AddProduct() {
  const router = useRouter();
  const [preview, setPreview] = useState(null);
  const [fileList, setFileList] = useState([]);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      title: "",
      description: "",
      status: "active",
      date: null,
      image: null,
    },
  });

  const onSubmit = async (data) => {
    const formData = new FormData();
    formData.append("title", data.title);
    formData.append("description", data.description || "");
    formData.append("status", data.status);
    formData.append("date", dayjs(data.date).format("YYYY-MM-DD"));
    if (fileList[0]) {
      formData.append("image", fileList[0].originFileObj);
    }

    try {
      await axios.post("/api/products", formData);
      message.success("✅ Product added successfully");
      router.push("/");
    } catch (err) {
      message.error("❌ Failed to add product");
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) setPreview(URL.createObjectURL(file));
  };

  return (
    <div className={styles.formContainer}>
      <h2 className={styles.heading}>Add New Product</h2>
      <form onSubmit={handleSubmit(onSubmit)} encType="multipart/form-data">
        {/* Title */}
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Product Title</label>
          <Controller
            name="title"
            control={control}
            render={({ field }) => (
              <Input {...field} placeholder="Enter product title" />
            )}
          />
          {errors.title && (
            <p className={styles.errorMsg}>{errors.title.message}</p>
          )}
        </div>

        {/* Description */}
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Description</label>
          <Controller
            name="description"
            control={control}
            render={({ field }) => (
              <TextArea
                {...field}
                rows={4}
                placeholder="Enter product description"
              />
            )}
          />
        </div>

        {/* Status */}
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Status</label>
          <Controller
            name="status"
            control={control}
            render={({ field }) => (
              <Select {...field} style={{ width: "100%" }}>
                <Option value="active">Active</Option>
                <Option value="inactive">Inactive</Option>
              </Select>
            )}
          />
        </div>

        {/* Date */}
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Date</label>
          <Controller
            name="date"
            control={control}
            render={({ field }) => (
              <DatePicker
                {...field}
                format="YYYY-MM-DD"
                style={{ width: "100%" }}
                onChange={(date) => field.onChange(date)}
              />
            )}
          />
          {errors.date && (
            <p className={styles.errorMsg}>{errors.date.message}</p>
          )}
        </div>

        {/* Image Upload */}
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Upload Image</label>
          <Upload
            listType="picture"
            maxCount={1}
            beforeUpload={() => false} 
            fileList={fileList}
            onChange={({ fileList: newFileList }) => {
              const latestFile = newFileList.slice(-1); 
              setFileList(latestFile);

              if (latestFile[0]) {
                const url = URL.createObjectURL(latestFile[0].originFileObj);
                setPreview(url);
                setValue("image", latestFile[0].originFileObj);
              }
            }}
          >
            <Button icon={<UploadOutlined />}>Click to Upload</Button>
          </Upload>
        </div>

        {/* Submit Button */}
        <div style={{ display: "flex", gap: "1rem" }}>
          <Button
            className={styles.submitBtn}
            type="primary"
            htmlType="submit"
            block
            style={{ flex: 1 }}
          >
             Add Product
          </Button>

          <Button
            danger
            block
            style={{ flex: 1 }}
            onClick={() => router.push("/")}
          >
             Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
