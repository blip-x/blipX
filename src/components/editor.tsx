import Quill, { QuillOptions } from 'quill';
import 'quill/dist/quill.snow.css'
import { MutableRefObject, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Button } from './ui/button';
import { PiTextAa } from 'react-icons/pi'
import { MdSend } from 'react-icons/md'
import { ImageIcon, Smile, XIcon } from 'lucide-react';
import { Hint } from './hint';
import { Delta, Op } from 'quill/core';
import { cn } from '@/lib/utils';
import { EmojiPopover } from './emoji-popover';
import Image from 'next/image';
type EditorValue = {
  image: File | null;
  body: string;
}
interface Props {
  onSubmit: ({ image, body }: EditorValue) => void;
  onCancel?: () => void;
  placeholder?: string;
  defaultValue?: Delta | Op[];
  innerRef?: MutableRefObject<Quill | null>,
  disabled?: boolean
  variant?: "create" | "update";
}
const Editor = ({
  onSubmit,
  onCancel,
  placeholder = "Write Something...",
  disabled = false,
  innerRef,
  defaultValue = [],
  variant = "create"
}: Props) => {
  const [text, setText] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [toolbarVisible, setToolbarVisible] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const submitRef = useRef(onSubmit);
  const placeholderRef = useRef(placeholder);
  const defaultValueRef = useRef(defaultValue);
  const quillRef = useRef<Quill | null>(null);
  const disabledRef = useRef(disabled);
  const imageRef = useRef<HTMLInputElement>(null);

  useLayoutEffect(() => {
    submitRef.current = onSubmit;
    placeholderRef.current = placeholder;
    disabledRef.current = disabled;
    defaultValueRef.current = defaultValue;
  })

  useEffect(() => {
    if(!containerRef.current) return;
    const container = containerRef.current;
    const editorContainer = container.appendChild(
      container.ownerDocument.createElement("div")
    );

    const options: QuillOptions = {
      theme: "snow",
      placeholder: placeholderRef.current,
      modules: {
        toolbar: [
          ["bold", "italic", "strike"],
          ["link"],
          [{ list: "ordered" }, { list: "bullet" }]
        ],
        keyboard: {
          bindings: {
            enter: {
              key: "Enter",
              handler: () => {
                const text = quill.getText();
                const addedImage = imageRef.current?.files?.[0] || null;
                const isEmpty = !addedImage && text.replace(/<(.|\n)*?>/g, "").trim().length === 0;
                if(isEmpty) {
                  return;
                }
                submitRef.current?.({ body: JSON.stringify(quill.getContents()), image: addedImage });
                return;
              }
            },
            shift_enter: {
              key: "Enter",
              shiftKey: true,
              handler: () => {
                quill.insertText(quill.getSelection()?.index || 0, '\n');
              }
            }
          }
        }
      }
    };

    const quill = new Quill(editorContainer, options);
    quillRef.current = quill;
    quillRef.current.focus();
    if(innerRef) {
      innerRef.current = quill;
    }
    
    quill.setContents(defaultValueRef.current);
    setText(quill.getText());

    quill.on(Quill.events.TEXT_CHANGE, () => {
      setText(quill.getText());
    });

    return () => {
      quill.off(Quill.events.TEXT_CHANGE);
      if(container) {
        container.innerHTML = "";
      }
      if(quillRef) {
        quillRef.current = null;
      }
      if(innerRef) {
        innerRef.current = null;
      }
    }
  },[innerRef]);

  function toogleToolbar() {
    setToolbarVisible((current) => !current);
    const toolbarElement = containerRef.current?.querySelector(".ql-toolbar");
    if(toolbarElement) {
      toolbarElement.classList.toggle("hidden");
    }
  }

  const isEmpty = !image && text.replace(/<(.|\n)*?>/g, "").trim().length === 0;

  const onEmojiSelect = (emoji: any) => {
    const quill = quillRef.current;
    quill?.insertText(quill?.getSelection()?.index || 0, emoji.native);
  }
  return ( 
    <div className="flex flex-col">
      <input 
        ref={imageRef}
        type="file" 
        className='hidden'
        accept='image/*'
        onChange={(event) => setImage(event.target.files![0])}
      />
      <div className={cn(
        "flex flex-col border border-slate-200 rounded-md overflow-hidden focus-within:border-slate-300 focus-within:shadow-sm",
        disabled && "opacity-50"
      )}>
        <div ref={containerRef} className='h-full ql-custom'/>
        {!!image && (
          <div className='p-2'>
            <div className='relative size-[62px] flex items-center justify-center group/image'>
            <Hint label="Remove Image">
                <button
                  onClick={() => {
                    setImage(null);
                    imageRef.current!.value = "";
                  }}
                  className='hidden group-hover/image:flex items-center justify-center border-2 border-white bg-black/70 hover:bg-black text-white absolute -top-2.5 -right-2.5 size-6 z-[4] rounded-full '
                >
                  <XIcon className='size-3.5'/>
                </button>
              </Hint>
              <Image 
                src={URL.createObjectURL(image)}
                alt={"Uploaded"}
                className='rounded-xl object-cover border overflow-hidden'
                fill
              />
            </div>
          </div>
        )}
        <div className='px-2 pb-2 flex z-[5]'>
          <Hint label={toolbarVisible? "Hide formatting": "Show formatting"}>
            <Button
              disabled={disabled}
              onClick={toogleToolbar}
              size={"iconSm"}
              variant={"ghost"}
            >
              <PiTextAa className='size-4'/>
            </Button>
          </Hint>
          <EmojiPopover onEmojiSelect={onEmojiSelect}>
            <Button
              disabled={disabled}
              onClick={() => {}}
              size={"iconSm"}
              variant={"ghost"}
            >
              <Smile className='size-4'/>
            </Button>
          </EmojiPopover>
          {variant === "create" && (
            <Hint label='Image'>
              <Button
                disabled={disabled}
                onClick={() => imageRef.current?.click()}
                size={"iconSm"}
                variant={"ghost"}
              >
                <ImageIcon className='size-4'/>
              </Button>
            </Hint>
          )}
          {variant === "update" && (
            <div className='ml-auto flex items-center gap-x-2'>
              <Button
                variant={"outline"}
                size={"sm"}
                disabled={disabled}
                onClick={onCancel}
              >
                Cancel
              </Button>
              <Button
                className='bg-[#007a5a] hover:bg-[#007a5a]/80 text-white'
                size={"sm"}
                disabled={disabled || isEmpty}
                onClick={() => onSubmit({
                  body: JSON.stringify(quillRef.current?.getContents()),
                  image
                })}
              >

                Save
              </Button>
            </div>
          )}
          {variant === "create" && (
            <Button
              disabled={disabled || isEmpty}
              onClick={() => onSubmit({
                body: JSON.stringify(quillRef.current?.getContents()),
                image
              })}
              size={"iconSm"}
              className={cn("ml-auto",
                          isEmpty ? 'bg-white hover:bg-white text-muted-foreground'
                                    : 'bg-[#007a5a] hover:bg-[#007a5a]/80 text-white'
                        )}
            >
              <MdSend className='size-4'/>
            </Button>
          )}
        </div>
      </div>
      {variant === "create" && (
        <div className={cn('p-2 text-[10px] text-muted-foreground flex justify-end opacity-0 transition', !isEmpty && "opacity-100")}>
          <p>
            <strong>Shift + Return</strong> to add a new line.
          </p>
        </div>
      )}
    </div>
  );
}

export default Editor;