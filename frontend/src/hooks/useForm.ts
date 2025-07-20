// 用于处理表单状态的自定义 Hook
// 该 Hook 封装了表单值管理、变更处理和重置逻辑
// 使用时只需传入初始表单值即可

import { useState } from "react";

function useForm<T extends Record<string, any>>(initialValues: T) {
  const [values, setValues] = useState<T>(initialValues);

  // 处理表单输入变更
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setValues(prev => ({
      ...prev,
      [name]: type === "checkbox" && "checked" in e.target
        ? (e.target as HTMLInputElement).checked
        : value,
    }));
  };

  // 重置表单
  const reset = () => setValues(initialValues);

  // 直接设置表单值
  const setFormValues = (newValues: Partial<T>) => {
    setValues(prev => ({
      ...prev,
      ...newValues,
    }));
  };

  return { values, handleChange, reset, setFormValues, setValues };
}

export default useForm;

// 使用方法示例：
// const { values, handleChange, reset } = useForm({ username: "", password: "" });
// <input name="username" value={values.username} onChange={handleChange} />