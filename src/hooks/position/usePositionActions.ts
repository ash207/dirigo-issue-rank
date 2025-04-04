
import { useDeletePosition } from "./useDeletePosition";
import { useUpdatePosition } from "./useUpdatePosition";

export const usePositionActions = (userId?: string) => {
  const { deletePosition, isDeleting } = useDeletePosition(userId);
  const { updatePosition, isEditing } = useUpdatePosition(userId);

  return {
    deletePosition,
    updatePosition,
    isDeleting,
    isEditing
  };
};
