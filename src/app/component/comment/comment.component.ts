import {
  AfterViewChecked,
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { CommentDto } from '../../dto/comment.dto';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { MaterialModule } from '../../material.module';
import { AuthService } from '../../service/auth.service';
import { CommentService } from '../../service/comment.service';
import {
  ConfirmDialogComponent,
  ConfirmDialogData,
} from '../confirm-dialog/confirm-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { ToastService } from '../../service/toast.service';

@Component({
  selector: 'app-comment',
  imports: [
    CommonModule,
    MaterialModule,
    FormsModule,
    ReactiveFormsModule,
    NgbModule,
    NgxChartsModule,
  ],
  templateUrl: './comment.component.html',
  styleUrl: './comment.component.css',
})
export class CommentComponent
  implements AfterViewInit, OnInit, AfterViewChecked
{
  loadingStatesComments = {
    replyComment: false,
    editComment: false,
    deleteComment: false,
  };

  errorStatesComments = {
    replyComment: null as string | null,
    editComment: null as string | null,
    deleteComment: null as string | null,
  };

  @Input() comment?: CommentDto;
  @Output() replyComment = new EventEmitter<boolean>();
  @Output() editComment = new EventEmitter<void>();
  @Output() deleteComment = new EventEmitter<void>();

  @ViewChild('contentElement') contentElement!: ElementRef<HTMLDivElement>;
  @ViewChild('parentContentElement')
  parentContentElement?: ElementRef<HTMLSpanElement>;

  showFullContent = false;
  showFullParentContent = false;

  isContentTruncated = false;
  isParentContentTruncated = false;

  showReplyForm = false;
  replyForm: FormGroup;

  userId: number | null = null;

  scrollToFirstComment = false;

  editMode = false;
  editForm: FormGroup;

  get isLoadingComments(): boolean {
    return Object.values(this.loadingStatesComments).some((state) => state);
  }

  constructor(
    private commentService: CommentService,
    private fb: FormBuilder,
    private authService: AuthService,
    private cdref: ChangeDetectorRef,
    private dialog: MatDialog,
    private toastService: ToastService
  ) {
    this.replyForm = this.fb.group({
      content: [
        '',
        [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(500),
        ],
      ],
    });

    this.editForm = this.fb.group({
      content: [
        '',
        [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(500),
        ],
      ],
    });
  }

  ngOnInit(): void {
    this.userId = this.authService.getUserId();
  }

  ngAfterViewInit(): void {
    this.isContentTruncated = this.checkIfTextTruncated(
      this.contentElement.nativeElement
    );
    if (this.parentContentElement) {
      this.isParentContentTruncated = this.checkIfTextTruncated(
        this.parentContentElement.nativeElement
      );
    }
    this.cdref.detectChanges();
  }

  ngAfterViewChecked(): void {
    if (this.contentElement) {
      this.isContentTruncated = this.checkIfTextTruncated(
        this.contentElement.nativeElement
      );
      this.cdref.detectChanges();
    }
  }

  setLoadingStateComments(
    key: keyof typeof this.loadingStatesComments,
    state: boolean
  ) {
    this.loadingStatesComments[key] = state;
  }

  setErrorStateComments(
    key: keyof typeof this.errorStatesComments,
    error: string | null
  ) {
    this.errorStatesComments[key] = error;
  }

  checkIfTextTruncated(element: HTMLElement): boolean {
    return element.scrollWidth > element.clientWidth;
  }

  toggleFullContent() {
    this.showFullContent = !this.showFullContent;
  }

  toggleFullParentContent() {
    this.showFullParentContent = !this.showFullParentContent;
  }

  submitReply() {
    if (this.replyForm.invalid || !this.comment) {
      return;
    }

    const replyContent = this.replyForm.get('content')?.value.trim();

    const replyDto: CommentDto = {
      content: replyContent,
      userId: this.userId!,
      projectId: this.comment.projectId,
      parentId: this.comment.id,
    };

    this.setLoadingStateComments('replyComment', true);

    this.commentService.createComment(replyDto).subscribe({
      next: () => {
        this.scrollToFirstComment = true;
        this.replyComment.emit(this.scrollToFirstComment);

        this.replyForm.reset();
        this.showReplyForm = false;

        this.setLoadingStateComments('replyComment', false);
        this.setErrorStateComments('replyComment', null);
      },
      error: (error) => {
        this.setLoadingStateComments('replyComment', false);
        this.setErrorStateComments('replyComment', error.message);
      },
    });
  }

  onEdit() {
    if (this.comment) {
      this.editForm.patchValue({
        content: this.comment.content,
      });
      this.editMode = true;
    }
  }

  cancelEdit(): void {
    this.editMode = false;
    this.editForm.reset();
  }

  submitEdit(): void {
    if (this.editForm.invalid || !this.comment) {
      return;
    }

    const updatedContent = this.editForm.get('content')?.value.trim();

    this.setLoadingStateComments('editComment', true);

    this.commentService
      .updateComment(this.comment.id!, updatedContent)
      .subscribe({
        next: (updatedComment: CommentDto) => {
          this.comment = updatedComment;
          this.editMode = false;
          this.editComment.emit();

          this.setLoadingStateComments('editComment', false);
          this.setErrorStateComments('editComment', null);
        },
        error: (error) => {
          this.setLoadingStateComments('editComment', false);
          this.setErrorStateComments('editComment', error.message);
        },
      });
  }

  onDelete() {
    const dialogData: ConfirmDialogData = {
      title: 'Delete Comment',
      message: 'Are you sure you want to delete this comment?',
      confirmText: 'Delete',
      cancelText: 'Cancel',
    };

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '100%',
      maxWidth: '400px',
      data: dialogData,
    });

    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (confirmed) {
        this.setLoadingStateComments('deleteComment', true);

        this.commentService.deleteComment(this.comment!.id!).subscribe({
          next: (deletedComment) => {
            this.comment = deletedComment;

            this.deleteComment.emit();

            this.setLoadingStateComments('deleteComment', false);
            this.setErrorStateComments('deleteComment', null);
          },
          error: (error) => {
            this.setLoadingStateComments('deleteComment', false);
            this.setErrorStateComments('deleteComment', error.message);
            this.toastService.show(this.errorStatesComments.deleteComment!, {
              classname: 'bg-danger text-light',
              delay: 5000,
            });
          },
        });
      }
    });
  }
}
