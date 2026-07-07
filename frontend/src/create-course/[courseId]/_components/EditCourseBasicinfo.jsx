import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FaEdit } from "react-icons/fa";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api";

function EditCourseBasicinfo({ course, onCourseUpdated }) {
  const [title, setTitle] = useState(course?.courseOutput?.courseName);
  const [description, setDescription] = useState(
    course?.courseOutput?.description
  );
  const [isSaving, setIsSaving] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const handleSave = async () => {
    if (!title || !description) {
      toast.error("Title and Description cannot be empty.");
      return;
    }

    setIsSaving(true);

    try {
      const result = await apiFetch(`/course/update/${course.courseId}`, {
        method: "PUT",
        body: JSON.stringify({
          name: title,
          courseOutput: {
            ...course.courseOutput,
            courseName: title,
            description,
          },
        }),
      });
      if (!result.success) throw new Error(result.message);

      toast.success("Course updated successfully!");
      onCourseUpdated?.();
      setIsOpen(false);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon" title="Edit Course Details">
          <FaEdit className="h-4 w-4" />
        </Button>
      </DialogTrigger>

      {/* ✅ Responsive dialog */}
      <DialogContent className="w-[95vw] max-w-md sm:max-w-lg md:max-w-xl rounded-2xl p-4 sm:p-6">
        <DialogHeader className="text-center sm:text-left">
          <DialogTitle>Edit Course Details</DialogTitle>
          <DialogDescription>
            Update your course title and description.
          </DialogDescription>
        </DialogHeader>

        {/* ✅ Form */}
        <div className="grid gap-5 py-4">
          {/* Title */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 sm:gap-4 items-start">
            <label className="text-sm font-medium sm:text-right">
              Title
            </label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="sm:col-span-3"
            />
          </div>

          {/* Description */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 sm:gap-4 items-start">
            <label className="text-sm font-medium sm:text-right">
              Description
            </label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="sm:col-span-3 resize-none"
            />
          </div>
        </div>

        {/* ✅ Footer */}
        <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-3">
          <DialogClose asChild>
            <Button
              variant="outline"
              disabled={isSaving}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
          </DialogClose>
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="w-full sm:w-auto"
          >
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default EditCourseBasicinfo;
