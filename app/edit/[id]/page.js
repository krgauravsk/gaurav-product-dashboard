"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { z } from "zod";
import axios from "axios";
import { useRouter } from "next/navigation";
import styles from "./EditProduct.module.css";

import { Input, Select, DatePicker, Upload, Button, message, Spin } from "antd";
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

export default function EditProduct({ params }) {
  const router = useRouter();
  const [preview, setPreview] = useState(null);
  const [fileList, setFileList] = useState([]);
  const [product, setProduct] = useState(null);

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await axios.get(`/api/products/${params.id}`);
        setProduct(res.data);
        setValue("title", res.data.title);
        setValue("description", res.data.description);
        setValue("status", res.data.status);
        setValue("date", dayjs(res.data.date));
        setPreview(res.data.imageUrl);
      } catch (err) {
        message.error("❌ Failed to load product");
      }
    };

    fetchProduct();
  }, [params.id, setValue]);

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
      await axios.put(`/api/products/${params.id}`, formData);
      message.success("✅ Product updated successfully");
      router.push("/");
    } catch (err) {
      message.error("❌ Failed to update product");
    }
  };

  const handleUploadChange = ({ fileList }) => {
    setFileList(fileList);
    if (fileList[0]) {
      const url = URL.createObjectURL(fileList[0].originFileObj);
      setPreview(url);
      setValue("image", fileList[0].originFileObj);
    }
  };

  if (!product) return <div  className={styles.spinContainer}>
     <Spin tip="Loading..."></Spin>
  </div>;

  return (
    <div className={styles.formContainer}>
      <h2 className={styles.heading}>✏️ Edit Product</h2>
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
          <label className={styles.formLabel}>
            Upload New Image (optional)
          </label>
         
          <Upload
            listType="picture"
            beforeUpload={() => false}
            maxCount={1}
            fileList={
              fileList.length
                ? fileList
                : preview
                ? [
                    {
                      uid: "-1",
                      name: "current-image.png",
                      status: "done",
                      url: preview,
                    },
                  ]
                : []
            }
            onChange={({ fileList: newFileList }) => {
              const latest = newFileList.slice(-1);
              setFileList(latest);

              if (latest[0]?.originFileObj) {
                setValue("image", latest[0].originFileObj);
              }
            }}
            showUploadList={{ showRemoveIcon: false }}
          >
            <Button icon={<UploadOutlined />}>Change Image</Button>
          </Upload>

        </div>

        {/* Submit Button */}
        <div style={{ display: "flex", gap: "1rem" }}>
          <Button
            className={styles.submitBtn}
            type="primary"
            htmlType="submit"
            block
          >
             Update Product
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
