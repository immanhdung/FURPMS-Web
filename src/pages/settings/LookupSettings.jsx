import React, { useState } from "react";
import { useLookup } from "../../hooks/useLookups";
import { Button } from "../../components/ui/button";
import { LoadingState } from "../../components/shared/LoadingState";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { Plus, Pencil, Check, X, Ban, Settings2 } from "lucide-react";

// ────────────────────────────────────────────────────────────────────────
// Generic Lookup Table Component
// ────────────────────────────────────────────────────────────────────────

function LookupTable({ endpoint, columnsConfig }) {
  const { useGetItems, useCreateItem, useUpdateItem, useToggleActive } = useLookup(endpoint);
  
  const { data: items = [], isLoading } = useGetItems();
  const createMutation = useCreateItem();
  const updateMutation = useUpdateItem();
  const toggleMutation = useToggleActive();

  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [isAdding, setIsAdding] = useState(false);
  const [addForm, setAddForm] = useState({});

  if (isLoading) return <LoadingState message="Đang tải danh mục…" className="min-h-[200px]" />;

  // ─── Handlers ───
  const startEdit = (item) => {
    setEditingId(item.id);
    setEditForm({ ...item });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({});
  };

  const saveEdit = async () => {
    try {
      await updateMutation.mutateAsync({ id: editingId, payload: editForm });
      setEditingId(null);
    } catch (e) {
      // handled in hook
    }
  };

  const startAdd = () => {
    setIsAdding(true);
    setAddForm({});
  };

  const cancelAdd = () => {
    setIsAdding(false);
    setAddForm({});
  };

  const saveAdd = async () => {
    try {
      await createMutation.mutateAsync(addForm);
      setIsAdding(false);
      setAddForm({});
    } catch (e) {
      // handled in hook
    }
  };

  const toggleActive = async (id) => {
    try {
      await toggleMutation.mutateAsync(id);
    } catch (e) {
      // handled in hook
    }
  };

  // ─── Rendering Helpers ───
  const renderCellInput = (formState, setFormState, col) => {
    if (col.type === "number") {
      return (
        <input
          type="number"
          className="w-full h-8 px-2 rounded-md border border-input text-sm"
          value={formState[col.key] || ""}
          onChange={(e) => setFormState({ ...formState, [col.key]: Number(e.target.value) })}
        />
      );
    }
    return (
      <input
        type="text"
        className="w-full h-8 px-2 rounded-md border border-input text-sm"
        value={formState[col.key] || ""}
        onChange={(e) => setFormState({ ...formState, [col.key]: e.target.value })}
      />
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={startAdd} disabled={isAdding || editingId !== null} size="sm">
          <Plus size={16} className="mr-2" /> Thêm mới
        </Button>
      </div>

      <div className="border border-border rounded-xl bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-surface/50">
                {columnsConfig.map((col) => (
                  <TableHead key={col.key} className="font-semibold">{col.label}</TableHead>
                ))}
                <TableHead className="font-semibold text-center w-24">Trạng thái</TableHead>
                <TableHead className="font-semibold text-right w-28">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {/* Add Row */}
              {isAdding && (
                <TableRow className="bg-primary/5">
                  {columnsConfig.map((col) => (
                    <TableCell key={col.key}>
                      {renderCellInput(addForm, setAddForm, col)}
                    </TableCell>
                  ))}
                  <TableCell className="text-center text-sm text-muted-foreground">—</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="icon" onClick={saveAdd} className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50" disabled={createMutation.isPending}>
                        <Check size={16} />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={cancelAdd} className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50">
                        <X size={16} />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              )}

              {/* Data Rows */}
              {items.map((item) => {
                const isEditing = editingId === item.id;
                
                return (
                  <TableRow key={item.id}>
                    {columnsConfig.map((col) => (
                      <TableCell key={col.key}>
                        {isEditing ? (
                          renderCellInput(editForm, setEditForm, col)
                        ) : (
                          <span className={col.type === "number" ? "font-mono" : ""}>{item[col.key]}</span>
                        )}
                      </TableCell>
                    ))}
                    <TableCell className="text-center">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        item.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                      }`}>
                        {item.isActive ? "ACTIVE" : "INACTIVE"}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      {isEditing ? (
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="icon" onClick={saveEdit} className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50" disabled={updateMutation.isPending}>
                            <Check size={16} />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={cancelEdit} className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50">
                            <X size={16} />
                          </Button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-end gap-1">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => startEdit(item)} 
                            className="h-8 w-8 text-muted-foreground"
                            disabled={isAdding || editingId !== null}
                          >
                            <Pencil size={14} />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => toggleActive(item.id)} 
                            className={`h-8 w-8 ${item.isActive ? "text-orange-600 hover:bg-orange-50" : "text-green-600 hover:bg-green-50"}`}
                            disabled={isAdding || editingId !== null || toggleMutation.isPending}
                            title={item.isActive ? "Vô hiệu hóa" : "Kích hoạt"}
                          >
                            {item.isActive ? <Ban size={14} /> : <Check size={14} />}
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
              
              {!isAdding && items.length === 0 && (
                <TableRow>
                  <TableCell colSpan={columnsConfig.length + 2} className="text-center py-8 text-muted-foreground">
                    Chưa có dữ liệu.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────
// Main Page
// ────────────────────────────────────────────────────────────────────────

const TABS = [
  { id: "budget", label: "Hạng mục chi phí", endpoint: "/budget-expense-categories", cols: [{key: "code", label: "Mã"}, {key: "name", label: "Tên hạng mục"}] },
  { id: "financial", label: "Cấu hình tài chính", endpoint: "/financial-configs", cols: [{key: "code", label: "Khóa (Key)"}, {key: "name", label: "Mô tả"}, {key: "value", label: "Giá trị (Value)"}] },
  { id: "personnel", label: "Loại nhân sự", endpoint: "/personnel-role-types", cols: [{key: "code", label: "Mã"}, {key: "name", label: "Vai trò"}] },
  { id: "product", label: "Loại sản phẩm", endpoint: "/product-categories", cols: [{key: "code", label: "Mã"}, {key: "name", label: "Tên loại"}] },
  { id: "unit", label: "Đơn vị tổ chức", endpoint: "/organizational-units", cols: [{key: "code", label: "Mã đơn vị"}, {key: "name", label: "Tên đơn vị"}] },
  { id: "rubric", label: "Tiêu chí chấm điểm (Rubric)", endpoint: "/rubric-criteria", cols: [{key: "code", label: "Mã tiêu chí"}, {key: "name", label: "Tên tiêu chí"}, {key: "max_score", label: "Điểm tối đa", type: "number"}] },
  { id: "amendment", label: "Loại sửa đổi", endpoint: "/amendment-categories", cols: [{key: "code", label: "Mã"}, {key: "name", label: "Loại sửa đổi"}] },
];

export default function LookupSettings() {
  const [activeTab, setActiveTab] = useState(TABS[0].id);

  const currentTabConfig = TABS.find(t => t.id === activeTab);

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Settings2 size={24} className="text-primary" /> Cấu hình Danh mục (Lookups)
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Quản lý các bảng tra cứu hệ thống. Dữ liệu này được dùng chung trên toàn ứng dụng.
        </p>
      </div>

      {/* Content Layout */}
      <div className="flex flex-col lg:flex-row gap-6">
        
        {/* Left Side: Tabs Vertical Navigation (Desktop) / Horizontal Scroll (Mobile) */}
        <div className="lg:w-64 shrink-0 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0">
          <div className="flex lg:flex-col gap-1 min-w-max lg:min-w-0">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center text-sm font-medium px-4 py-2.5 rounded-lg transition-colors whitespace-nowrap lg:whitespace-normal text-left ${
                  activeTab === tab.id
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-surface-variant hover:text-foreground"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Right Side: Tab Content */}
        <div className="flex-1 min-w-0">
          {currentTabConfig && (
            <div key={currentTabConfig.id} className="animate-in fade-in duration-300">
              <h2 className="text-lg font-bold mb-4">{currentTabConfig.label}</h2>
              <LookupTable 
                endpoint={currentTabConfig.endpoint} 
                columnsConfig={currentTabConfig.cols} 
              />
            </div>
          )}
        </div>
        
      </div>
    </div>
  );
}
