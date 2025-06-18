import {
    Button,
    Dialog,
    DialogActions,
    DialogTitle,
    DialogContent,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    TextField,
    Modal,
  } from "@mui/material";
  import React, { useEffect, useState, useRef } from "react";
  import { axioInstance } from "../api/axios/axios";
  import { endpoints } from "../api/endpoints/endpoints";
  import EditIcon from "@mui/icons-material/Edit";
  import DeleteIcon from "@mui/icons-material/Delete";
  import RotateRightIcon from "@mui/icons-material/RotateRight";
  import AddIcon from "@mui/icons-material/Add";
  import NotFoundImage from "../../public/404_Image.png";
  import { showToast } from "../toastConfig";
  import UnfoldMoreIcon from "@mui/icons-material/UnfoldMore";
  import UnfoldLessIcon from "@mui/icons-material/UnfoldLess";
  import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
  
  const Product = ({ currentSegment }) => {
    const convertNewlines = (text) => {
      return text
        .trim()
        .replace(/\s*\n\s*/g, "\n") // Clean up spaces around newlines
        .replace(/\n{3,}/g, "\n\n") // Limit to max 2 consecutive newlines
        .split("\n\n")
        .filter((para) => para.trim()) // Remove empty paragraphs
        .map((paragraph) => paragraph.replace(/\n/g, "\\n"))
        .join("\\n\\n");
    };
  
    const [editingData, setEditingData] = useState({});
    const [deleteId, setDeleteId] = useState({});
    const [addData, setAddData] = useState(false);
    const [product, setProduct] = useState([]);
    const [loadingProduct, setLoadingProduct] = useState(false);
    const [validationError, setValidationError] = useState({});
    const [loading, setLoading] = useState(false);
    const [scrollPosition, setScrollPosition] = useState(0);
    const textFieldRef = useRef(null);
    const [showMore, setShowMore] = useState(false);
    const [industriesData, setIndustriesData] = useState([]);
    const [showIndustryList, setShowIndustryList] = useState(true);
  
    const readProduct = async () => {
      setLoadingProduct(true);
      try {
        let data = await axioInstance.get(endpoints.ai.product);
        if (data?.data?.length) {
          setProduct(data?.data);
        } else {
          setProduct([]);
        }

        let industriData = await axioInstance.get(endpoints.ai.industries);
        if (industriData?.data?.length > 0) {
          setIndustriesData(industriData?.data);
        } else {
          setIndustriesData([]);
        }
      } catch (error) {
        setProduct([]);
        console.log(error, "_error_");
      } finally {
        setLoadingProduct(false);
      }
    };
  
    const createProduct = async () => {
      setLoading(true);
      try {
        let data = await axioInstance.post(endpoints.ai.product, {
          name: editingData?.name,
          details: convertNewlines(editingData?.details),
          industry_id: editingData?.industry_id,
        });
        if (data?.data?.product_id) {
          readProduct();
          setEditingData({});
          setAddData(false);
          setShowMore(false);
          showToast.success("Product size created successfully");
        }
      } catch (error) {
        showToast.error(
          error?.response?.data?.message || "Failed to create Product size"
        );
        console.log(error, "_error_");
      } finally {
        setLoading(false);
      }
    };
  
    const updateProduct = async () => {
      setLoading(true);
      try {
        let data = await axioInstance.put(
          `${endpoints.ai.product}${editingData?.id}`,
          {
            name: editingData?.name,
            details: convertNewlines(editingData?.details),
            industry_id: editingData?.industry_id,
          }
        );
        if (data?.data?.product_id) {
          readProduct();
          setEditingData({});
          setAddData(false);
          setShowMore(false);
          showToast.success("Product size updated successfully");
        }
      } catch (error) {
        showToast.error(
          error?.response?.data?.message || "Failed to update Product size"
        );
        console.log(error, "_error_");
      } finally {
        setLoading(false);
      }
    };
  
    const deleteProduct = async (id) => {
      try {
        let data = await axioInstance.delete(
          `${endpoints.ai.product}${id}`
        );
        if (data?.status === 204) {
          readProduct();
          setDeleteId({});
          setShowMore(false);
          showToast.success("Product size deleted successfully");
        }
      } catch (error) {
        showToast.error(
          error?.response?.data?.message || "Failed to delete Product size"
        );
        console.log(error, "_error_");
      }
    };
  
    const validateProduct = (data) => {
      const errors = {};
      if (!data?.name) errors.name = "Name is required";
      if (!data?.details) errors.details = "Prompt Template is required";
      if (!data?.industry_id) errors.industry_id = "Industry is required";
      return errors;
    };
  
    console.log(deleteId, "__industries_");
    useEffect(() => {
      readProduct();
    }, []);
  
    return (
      <>
        {/* role */}
        {currentSegment === "product" && (
          <div style={{ width: "100%", pt: "40px" }}>
            {addData ? (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "end",
                }}
              >
                <TextField
                  fullWidth
                  margin="normal"
                  label={"Name"}
                  value={editingData?.name}
                  onChange={(e) => {
                    setEditingData({ ...editingData, name: e.target.value });
                    if (validationError.name)
                      setValidationError((prev) => ({
                        ...prev,
                        name: undefined,
                      }));
                  }}
                  error={!!validationError.name}
                  helperText={validationError.name}
                />

                <div className="relative w-full">
                  <TextField
                    fullWidth
                    margin="normal"
                    label={"Prompt Template"}
                    multiline
                    rows={showMore ? null : 6}
                    inputRef={textFieldRef}
                    value={editingData?.details
                      ?.replace(/\\n\\n/g, "\n\n")
                      .replace(/\\n/g, "\n")}
                    onKeyDown={(e) => {
                      const textarea = e.target;
                      const cursorPosition = textarea.selectionStart;
                      const scrollTop = textarea.scrollTop;
  
                      requestAnimationFrame(() => {
                        textarea.selectionStart = cursorPosition;
                        textarea.selectionEnd = cursorPosition;
                        textarea.scrollTop = scrollTop;
                      });
                    }}
                    onChange={(e) => {
                      const textarea = e.target;
                      const cursorPosition = textarea.selectionStart;
                      const scrollTop = textarea.scrollTop;
  
                      setEditingData({
                        ...editingData,
                        details: e.target.value.replace(/"/g, "'"),
                      });
                      if (validationError.details)
                        setValidationError((prev) => ({
                          ...prev,
                          details: undefined,
                        }));
  
                      requestAnimationFrame(() => {
                        textarea.selectionStart = cursorPosition;
                        textarea.selectionEnd = cursorPosition;
                        textarea.scrollTop = scrollTop;
                      });
                    }}
                    error={!!validationError.details}
                    helperText={validationError.details}
                  />
                  <div
                    className="absolute right-3 bottom-0.5 bg-green-500 w-10 py-0.5 rounded flex items-center justify-center cursor-pointer"
                    onClick={() => setShowMore(!showMore)}
                  >
                    {!showMore ? (
                      <UnfoldMoreIcon className="!w-3.5 !h-3.5" />
                    ) : (
                      <UnfoldLessIcon className="!w-3.5 !h-3.5" />
                    )}
                  </div>
                </div>

                {/* Industry Selection */}
                <div className="w-full flex flex-col items-start gap-2 mt-4">
                  <div className="w-full border border-solid rounded">
                    <div
                      className="p-3 flex items-center justify-between cursor-pointer"
                      onClick={() => {
                        setShowIndustryList(!showIndustryList);
                        if (validationError.industry_id)
                          setValidationError((prev) => ({
                            ...prev,
                            industry_id: undefined,
                          }));
                      }}
                    >
                      <p>Select Industry</p>
                      <KeyboardArrowDownIcon
                        className={`${showIndustryList ? "rotate-180" : "rotate-0"}`}
                      />
                    </div>
                    {showIndustryList && (
                      <>
                        <hr />
                        {industriesData?.length
                          ? industriesData.map((v, i) => (
                            <div
                              key={i}
                              className={`p-3 border-b border-solid flex items-center gap-2 cursor-pointer capitalize`}
                              onClick={() => {
                                setEditingData((pre) => ({
                                  ...pre,
                                  industry_id: v?.industry_id,
                                }));
                                if (validationError.industry_id)
                                  setValidationError((prev) => ({
                                    ...prev,
                                    industry_id: undefined,
                                  }));
                              }}
                            >
                              <div
                                className={`rounded-full w-4 h-4 ${editingData?.industry_id === v?.industry_id ? "border-2 border-solid border-[#fbd255] bg-[#fbd255]" : "border-2 border-solid border-[#fbd255]"}`}
                              />
                              {v?.name.replace(/_/g, " ")}
                            </div>
                          ))
                          : null}
                      </>
                    )}
                  </div>
                  {validationError.industry_id && (
                    <p
                      style={{ color: "red", margin: "0 16px", fontSize: "13px" }}
                    >
                      {validationError.industry_id}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2 mt-4">
                  <Button
                    variant="outlined"
                    className="!border !border-red-600 !bg-transparent w-fit"
                    onClick={() => {
                      setEditingData({});
                      setAddData(false);
                      setShowMore(false);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="contained"
                    className="!border !border-green-500 !bg-green-500 w-fit"
                    onClick={() => {
                      const errors = validateProduct(editingData);
                      if (Object.keys(errors).length > 0) {
                        setValidationError(errors);
                        return;
                      }
                      setValidationError({});
                      if (editingData?.id) {
                        updateProduct();
                      } else {
                        createProduct();
                      }
                    }}
                    disabled={loading}
                  >
                    {loading ? (
                      <RotateRightIcon className="animate-spin" />
                    ) : (
                      "Save"
                    )}
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell
                        sx={{ textAlign: "left" }}
                        className="!font-bold capitalize"
                      >
                        name
                      </TableCell>
                      <TableCell
                        sx={{ textAlign: "left" }}
                        className="!font-bold capitalize"
                      >
                        industry
                      </TableCell>
                      <TableCell
                        sx={{ textAlign: "right" }}
                        className="!font-bold capitalize"
                      >
                        Action
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {loadingProduct ? (
                      <TableRow>
                        <TableCell colSpan={3} className="w-full">
                          <div className="flex items-center justify-center h-60">
                            <RotateRightIcon className="animate-spin !text-5xl" />
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : product?.length ? (
                      product.map((v, i) => (
                        <TableRow key={i}>
                          <TableCell className="capitalize">
                            {v?.name.replace(/_/g, " ")}&nbsp;
                            {v?.name === "small"
                              ? "(1-500)"
                              : v?.name === "medium"
                                ? "(501-5,000)"
                                : v?.name === "large"
                                  ? "(5,000+)"
                                  : ""}
                          </TableCell>
                          <TableCell className="capitalize">
                            {v?.industry?.name?.replace(/_/g, " ")}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center justify-end gap-2">
                              <div
                                className="rounded border border-solid border-cyan-500 hover:bg-cyan-500 text-cyan-500 hover:text-white cursor-pointer py-1 px-4 w-fit"
                                onClick={() => {
                                  setAddData(true);
                                  setEditingData({
                                    name: v?.name,
                                    details: v?.details,
                                    id: v?.product_id,
                                    industry_id: v?.industry_id,
                                  });
                                }}
                              >
                                <EditIcon className="!text-lg" />
                              </div>
                              <div
                                className="rounded border border-solid border-red-400 hover:bg-red-400 text-red-400 hover:text-white cursor-pointer py-1 px-4 w-fit"
                                onClick={() =>
                                  setDeleteId({
                                    name: v?.name,
                                    id: v?.product_id,
                                  })
                                }
                              >
                                <DeleteIcon className="!text-lg" />
                              </div>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={3} className="w-full">
                          <div className="flex items-center justify-center h-60 relative">
                            <img
                              src={NotFoundImage}
                              alt="404"
                              className="w-auto h-full"
                            />
                            <p className="text-lg absolute bottom-[15%]">
                              Oops... data not found
                            </p>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
  
                <div className="flex items-center justify-end mt-4">
                  <div
                    className="rounded border border-solid border-blue-600 hover:bg-blue-600 text-blue-600 hover:text-white cursor-pointer py-1 px-4 w-fit flex items-center gap-2"
                    onClick={() => setAddData(true)}
                  >
                    <AddIcon className="!text-lg" />
                    Add
                  </div>
                </div>
              </>
            )}
            <Dialog open={deleteId?.id} onClose={() => setDeleteId({})}>
              <DialogTitle>Delete Confirmation</DialogTitle>
              <DialogContent>
                Are you sure you want to delete <b>{deleteId?.name}</b> prompt?
              </DialogContent>
              <DialogActions>
                <Button
                  variant="outlined"
                  className="!border !border-green-600 !text-green-600 !bg-transparent w-fit"
                  onClick={() => setDeleteId({})}
                >
                  Close
                </Button>
                <Button
                  variant="contained"
                  className="!bg-red-600 !text-white w-fit"
                  onClick={() => deleteProduct(deleteId?.id)}
                  autoFocus
                >
                  Delete
                </Button>
              </DialogActions>
            </Dialog>
          </div>
        )}
      </>
    );
  };
  
  export default Product;
  