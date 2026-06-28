import React, { useState, useEffect } from "react";
import { FormField } from "../../../components/forms/FormField";
import { SelectField } from "../../../components/forms/SelectField";
import { useWizard } from "../../../components/forms/StepWizard";
import { useManageBudget } from "../../../hooks/useProposals";
import { Plus, Trash2, Calculator, Save } from "lucide-react";
import { cn, formatCurrency } from "../../../lib/utils";

const BUDGET_CATEGORIES = [
  { value: "LABOR", label: "Tiền công lao động" },
  { value: "MATERIALS", label: "Nguyên vật liệu, năng lượng" },
  { value: "EQUIPMENT", label: "Thiết bị, máy móc" },
  { value: "MANAGEMENT", label: "Chi phí quản lý" },
  { value: "OTHER", label: "Chi phí khác" },
];

export function Step3Budget({ proposalId, initialBudget = { totalAmount: 0, items: [] } }) {
  const { goNext, goBack } = useWizard();
  const { updateItems } = useManageBudget();
  
  const [items, setItems] = useState(
    initialBudget?.items?.length > 0 
      ? initialBudget.items 
      : [{ id: Date.now(), category: "LABOR", description: "Lương chủ nhiệm đề tài", amount: 0, notes: "" }]
  );
  
  const [total, setTotal] = useState(initialBudget?.totalAmount || 0);

  // Recalculate total whenever items change
  useEffect(() => {
    const sum = items.reduce((acc, item) => acc + (Number(item.amount) || 0), 0);
    setTotal(sum);
  }, [items]);

  const handleAddItem = () => {
    setItems([...items, { id: Date.now(), category: "MATERIALS", description: "", amount: 0, notes: "" }]);
  };

  const handleRemoveItem = (id) => {
    setItems(items.filter(item => item.id !== id));
  };

  const handleChange = (id, field, value) => {
    setItems(items.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  const handleSaveAndNext = async () => {
    if (proposalId) {
      try {
        await updateItems.mutateAsync({ id: proposalId, payload: items });
        goNext();
      } catch (err) {
        console.error("Lỗi lưu ngân sách", err);
      }
    } else {
      goNext();
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-xl font-bold text-foreground">Dự toán ngân sách</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Liệt kê các khoản chi phí cần thiết để thực hiện đề tài.
          </p>
        </div>
        
        <div className="bg-primary/10 border border-primary/20 text-primary px-5 py-3 rounded-xl flex items-center gap-3">
          <Calculator size={24} />
          <div>
            <div className="text-xs font-semibold uppercase tracking-wide opacity-80">Tổng kinh phí</div>
            <div className="text-xl font-bold">{formatCurrency(total)}</div>
          </div>
        </div>
      </div>

      <div className="bg-surface/50 border border-border rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted text-muted-foreground uppercase text-xs font-semibold">
              <tr>
                <th className="px-4 py-3 w-1/4">Danh mục</th>
                <th className="px-4 py-3 w-1/3">Diễn giải</th>
                <th className="px-4 py-3 w-1/5">Thành tiền (VNĐ)</th>
                <th className="px-4 py-3 w-1/5">Ghi chú</th>
                <th className="px-4 py-3 text-center w-12"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {items.map((item, index) => (
                <tr key={item.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3">
                    <SelectField
                      options={BUDGET_CATEGORIES}
                      value={item.category}
                      onChange={(e) => handleChange(item.id, "category", e.target.value)}
                      className="w-full min-w-[150px]"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <FormField
                      value={item.description}
                      onChange={(e) => handleChange(item.id, "description", e.target.value)}
                      placeholder="Chi tiết khoản chi..."
                    />
                  </td>
                  <td className="px-4 py-3">
                    <FormField
                      type="number"
                      min={0}
                      value={item.amount}
                      onChange={(e) => handleChange(item.id, "amount", e.target.value)}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <FormField
                      value={item.notes}
                      onChange={(e) => handleChange(item.id, "notes", e.target.value)}
                      placeholder="Định mức, số lượng..."
                    />
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(item.id)}
                      disabled={items.length === 1}
                      className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
                      aria-label="Xóa dòng"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="p-4 border-t border-border bg-muted/20">
          <button
            type="button"
            onClick={handleAddItem}
            className="flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
          >
            <Plus size={16} />
            Thêm dòng chi phí
          </button>
        </div>
      </div>

      <div className="pt-8 flex justify-between items-center border-t mt-8">
        <button 
          type="button"
          onClick={goBack}
          className="px-6 py-2.5 rounded-md text-sm font-medium border border-input bg-background hover:bg-muted transition-colors"
        >
          Quay lại
        </button>
        <button 
          type="button"
          onClick={handleSaveAndNext}
          className="bg-primary text-primary-foreground px-6 py-2.5 rounded-md text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm flex items-center gap-2"
        >
          <Save size={16} />
          Lưu và Tiếp tục
        </button>
      </div>
    </div>
  );
}
