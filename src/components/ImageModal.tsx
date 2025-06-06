import { motion, AnimatePresence } from "framer-motion";
import { useEffect } from "react";
import { createPortal } from "react-dom";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  imageSrc: string;
  imageAlt?: string;
}

export function ImageModal({
  isOpen,
  onClose,
  imageSrc,
  imageAlt = "Modal image",
}: Props) {
  // Close modal on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      // Prevent body scroll when modal is open
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  // Create portal content
  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center"
          onClick={onClose} // Click outside to close
          style={{
            // Ensure modal is always on top
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
          }}
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />

          {/* Modal Content */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 30,
            }}
            className="relative z-10 w-full max-w-[90vw] max-h-[90vh] flex items-center justify-center pointer-events-none"
            onClick={handleClick} // Prevent closing when clicking on image
          >
            <img
              src={imageSrc}
              alt={imageAlt}
              className="max-w-full max-h-[90vh] w-auto h-auto object-contain rounded-lg shadow-2xl"
              draggable={false}
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  // Create portal to document.body
  return createPortal(modalContent, document.body);
}
