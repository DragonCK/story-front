import React, { Component } from 'react';
import styled from 'styled-components';
import type { EditorFromTextArea } from 'codemirror';
import { useSpring, animated } from 'react-spring';
import 'codemirror/lib/codemirror.css';

import TitleTextarea from './TitleTextarea';

import media, { mediaQuery } from '~/libs/styles/media';
import palette from '~/libs/styles/palette';
import zIndexes from '~/libs/styles/zIndexes';
import detectIOS from '~/libs/detectIOS';
import Toolbar from './Toolbar';
import AddLink from './AddLink';

function WriterHead({
  hide,
  children,
}: {
  hide: boolean;
  children: React.ReactNode;
}) {
  const screenHeight =
    (typeof window !== 'undefined' && window.screen.height) || 508;

  const springStyle = useSpring({
    maxHeight: hide ? 0 : screenHeight * 0.5,
    opacity: hide ? 0 : 1,
    config: {
      duration: 300,
    },
  });
  return (
    <animated.div style={springStyle}>
      <PaddingWrapper>{children}</PaddingWrapper>
    </animated.div>
  );
}

interface WriteMarkdownEditorProps {
  title: string;
  initialBody: string;
  tagInput: React.ReactNode;
  onChangeMarkdown: (markdown: string) => void;
  onChangeTitle: (title: string) => void;
}

interface WriteMarkdownEditorState {
  addLink: {
    top: number | null;
    bottom: number | null;
    left: number;
    visible: boolean;
    stickToRight: boolean;
  };
  askChangeEditor: boolean;
  clientWidth: number;
  hideUpper: boolean;
  appleCursorPos: number;
}

export class WriteMarkdownEditor extends Component<
  WriteMarkdownEditorProps,
  WriteMarkdownEditorState
> {
  private block = React.createRef<HTMLDivElement>();
  private toolbarElement = React.createRef<HTMLDivElement>();
  private editorElement = React.createRef<HTMLTextAreaElement>();
  private appleEditorElement = React.createRef<HTMLTextAreaElement>();

  private toolbarTop = 0;

  private codemirror: EditorFromTextArea | null = null;
  private ignore = false;
  private isIOS = false;

  constructor(props: WriteMarkdownEditorProps) {
    super(props);

    this.state = {
      addLink: {
        top: 0,
        bottom: 0,
        left: 0,
        visible: false,
        stickToRight: false,
      },
      askChangeEditor: false,
      clientWidth: 0,
      hideUpper: false,
      appleCursorPos: 0,
    };

    this.isIOS = detectIOS(typeof window === 'undefined');
  }

  initialize = () => {
    if (!this.editorElement.current) return;
    const CodeMirror = require('codemirror');
    require('codemirror/mode/markdown/markdown');
    require('codemirror/mode/javascript/javascript');
    require('codemirror/mode/jsx/jsx');
    require('codemirror/addon/display/placeholder');
    this.codemirror = CodeMirror.fromTextArea(this.editorElement.current, {
      mode: 'markdown',
      theme: 'one-light',
      placeholder: '당신의 이야기를 적어보세요...',
      lineWrapping: true,
    });

    if (!this.codemirror) return;

    this.codemirror.setValue(this.props.initialBody);
    this.codemirror.on('change', (cm) => {
      this.props.onChangeMarkdown(cm.getValue());
      this.stickToBottomIfNeeded();
      const doc = cm.getDoc();

      const { line } = doc.getCursor();
      const last = doc.lastLine();
      if (last - line < 5) {
        const preview = document.getElementById('preview');
        if (!preview) return;
        preview.scrollTop = preview.scrollHeight;
      }
    });

    this.codemirror.on('scroll', (cm) => {
      const info = cm.getScrollInfo();
      if (info.top > 0 && info.height > window.screen.height) {
        this.setState({ hideUpper: true });
      } else {
        this.setState({ hideUpper: false });
      }
    });

    this.codemirror.on('dragover', (_, e) => {
      if (e.dataTransfer) {
        e.dataTransfer.dropEffect = 'copy';
      }
    });

    this.codemirror.on('paste', ((editor: any, e: any) => {
      const clipboardData = e.clipboardData || e.originalEvent.clipboardData;
      if (!clipboardData) return;

      // replace text for embedding youtube, twitte, etc
      const text = clipboardData.getData('Text');
      const check = checkEmbed(text);
      if (check) {
        const selection = editor.getSelection();
        e.preventDefault();
        if (selection.length > 0) {
          editor.replaceSelection(check);
        } else {
          const doc = editor.getDoc();
          const cursor = doc.getCursor();
          const pos = {
            line: cursor.line,
            ch: cursor.ch,
          };
          doc.replaceRange(check, pos);
        }
        return;
      }

      const { items } = clipboardData;
      if (!items) return;
      if (items.length !== 2) return;
      if (items[1].kind === 'file') {
        e.preventDefault();
      }
    }) as any);
  };

  stickToBottomIfNeeded = () => {
    if (!this.block.current) return;
    const { scrollHeight, scrollTop, clientHeight } = this.block.current;
    const scrollBottom = scrollHeight - scrollTop - clientHeight;
    if (scrollBottom < 192) {
      this.block.current.scrollTo(0, scrollHeight);
    }
  };

  addImageToEditor = (image: string) => {
    if (!this.codemirror) return;
    this.codemirror.getDoc().replaceSelection(`![](${encodeURI(image)})`);
  };

  componentDidMount() {
    this.initialize();
    setTimeout(() => {
      if (this.toolbarElement.current) {
        this.toolbarTop = this.toolbarElement.current.getBoundingClientRect().top;
      }
    });

    if (this.block.current) {
      this.setState({
        clientWidth: this.block.current.clientWidth,
      });
    }

    window.addEventListener('resize', this.handleResize);
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.handleResize);
  }

  handleChangeTtitle = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    this.props.onChangeTitle(e.target.value);
  };

  handleResize = () => {
    if (this.block.current) {
      this.setState({
        clientWidth: this.block.current.clientWidth,
      });
    }
  };

  handleOpenAddLink = () => {
    if (!this.codemirror) return;
    const doc = this.codemirror.getDoc();
    const cursor = doc.getCursor();
    const cursorPos = this.codemirror.cursorCoords(cursor);
    if (!this.block.current) return;

    const stickToRight = cursorPos.left > this.block.current.clientWidth - 341;
    const calculatedTop =
      this.block.current.scrollTop +
      cursorPos.top +
      this.codemirror.defaultTextHeight() / 2 +
      1;

    const isAtBottom = calculatedTop + 173 > this.block.current?.clientHeight;
    const pos = isAtBottom
      ? { top: null, bottom: 64 }
      : { top: calculatedTop, bottom: null };
    this.setState({
      addLink: {
        visible: true,
        ...pos,
        left: cursorPos.left,
        stickToRight,
      },
    });
  };

  handleConfirmAddLink = (link: string) => {
    // 링크삽입하는 내용
    this.setState({
      addLink: {
        ...this.state.addLink,
        visible: false,
      },
    });
    if (!this.codemirror) return;
    const doc = this.codemirror.getDoc();
    const selection = doc.getSelection();
    const cursor = doc.getCursor('end');
    this.codemirror.focus();
    if (selection.length === 0) {
      doc.replaceSelection(`[링크텍스트](${link})`);
      doc.setSelection(
        {
          line: cursor.line,
          ch: cursor.ch + 1,
        },
        {
          line: cursor.line,
          ch: cursor.ch + 6,
        }
      );
      return;
    }
    doc.replaceSelection(`[${selection}](${link})`);
    doc.setCursor({
      line: cursor.line,
      ch: cursor.ch + link.length + 4,
    });
  };

  handleCancelAddLink = () => {
    this.setState({
      addLink: {
        ...this.state.addLink,
        visible: false,
      },
    });
  };

  handleToolbarClick = (mode: string) => {
    const codemirror = this.codemirror;

    if (!codemirror) return;
    const doc = codemirror.getDoc();

    const cursor = doc.getCursor();
    const selection = {
      start: doc.getCursor('start'),
      end: doc.getCursor('end'),
    };

    const line = doc.getLine(cursor.line);

    const selectWholeLine = () => {
      doc.setSelection(
        {
          line: cursor.line,
          ch: 0,
        },
        {
          line: cursor.line,
          ch: line.length,
        }
      );
    };

    const handlers: {
      [key: string]: any;
    } = {
      ...[1, 2, 3, 4] // creates handlers for heading1, heading2, heading3, heading4
        .map((number) => () => {
          // create handler function
          const characters = '#'.repeat(number);
          const plain = removeHeading(line);
          selectWholeLine();
          doc.replaceSelection(`${characters} ${plain}`);
        })
        .reduce((headingHandlers, handler, index) => {
          // reduce into handlers object
          return Object.assign(headingHandlers, {
            [`heading${index + 1}`]: handler,
          });
        }, {}),
      bold: () => {
        const selected = doc.getSelection();
        if (selected === '텍스트') {
          const isBold = /\*\*(.*)\*\*/.test(
            doc.getRange(
              { line: selection.start.line, ch: selection.start.ch - 2 },
              { line: selection.end.line, ch: selection.end.ch + 2 }
            )
          );

          if (isBold) {
            doc.setSelection(
              { line: selection.start.line, ch: selection.start.ch - 2 },
              { line: selection.end.line, ch: selection.end.ch + 2 }
            );
            doc.replaceSelection('텍스트');
            doc.setSelection(
              { line: selection.start.line, ch: selection.start.ch - 2 },
              { line: selection.end.line, ch: selection.end.ch - 2 }
            );
            return;
          }
        }
        if (/\*\*(.*)\*\*/.test(selected)) {
          // matches **string**
          doc.replaceSelection(selected.replace(/\*\*/g, ''));
          doc.setSelection(
            {
              line: selection.start.line,
              ch: selection.start.ch,
            },
            { line: selection.end.line, ch: selection.end.ch - 4 }
          );
          return;
        }
        if (selected.length > 0) {
          doc.replaceSelection(`**${selected}**`);
          doc.setSelection(
            {
              line: selection.start.line,
              ch: selection.start.ch,
            },
            { line: selection.end.line, ch: selection.end.ch + 4 }
          );
          return;
        }
        doc.replaceSelection('**텍스트**');
        doc.setSelection(
          {
            line: cursor.line,
            ch: cursor.ch + 2,
          },
          {
            line: cursor.line,
            ch: cursor.ch + 5,
          }
        );
      },
      italic: () => {
        let selected = doc.getSelection();

        if (selected.length === 0) {
          doc.replaceSelection(`_텍스트_`);
          doc.setSelection(
            {
              line: cursor.line,
              ch: cursor.ch + 1,
            },
            {
              line: cursor.line,
              ch: cursor.ch + 4,
            }
          );
          return;
        }

        if (selected === '텍스트') {
          const selectLeftAndRight = doc.getRange(
            {
              line: selection.start.line,
              ch: selection.start.ch - 1,
            },
            {
              line: selection.end.line,
              ch: selection.end.ch + 1,
            }
          );
          if (/_(.*)_/.test(selectLeftAndRight)) {
            selected = selectLeftAndRight;
            doc.setSelection(
              {
                line: selection.start.line,
                ch: selection.start.ch - 1,
              },
              {
                line: selection.end.line,
                ch: selection.end.ch + 1,
              }
            );
            selection.start = {
              line: selection.start.line,
              ch: selection.start.ch - 1,
            };
            selection.end = {
              line: selection.end.line,
              ch: selection.end.ch + 1,
            };
          }
        }

        if (/_(.*)_/.test(selected)) {
          const plain = selected
            .replace(/^_/, '') // remove starting _
            .replace(/_$/, ''); // remove ending _
          doc.replaceSelection(plain);
          doc.setSelection(
            {
              line: selection.start.line,
              ch: selection.start.ch,
            },
            { line: selection.end.line, ch: selection.end.ch - 2 }
          );
          return;
        }
        if (selected.length > 0) {
          doc.replaceSelection(`_${selected}_`);
          doc.setSelection(
            {
              line: selection.start.line,
              ch: selection.start.ch,
            },
            { line: selection.end.line, ch: selection.end.ch + 2 }
          );
        }
      },
      strike: () => {
        let selected = doc.getSelection();

        if (selected.length === 0) {
          doc.replaceSelection(`~~텍스트~~`);
          doc.setSelection(
            {
              line: cursor.line,
              ch: cursor.ch + 2,
            },
            {
              line: cursor.line,
              ch: cursor.ch + 5,
            }
          );
          return;
        }

        if (selected === '텍스트') {
          const selectLeftAndRight = doc.getRange(
            {
              line: selection.start.line,
              ch: selection.start.ch - 2,
            },
            {
              line: selection.end.line,
              ch: selection.end.ch + 2,
            }
          );
          if (/~~(.*)~~/.test(selectLeftAndRight)) {
            selected = selectLeftAndRight;
            doc.setSelection(
              {
                line: selection.start.line,
                ch: selection.start.ch - 2,
              },
              {
                line: selection.end.line,
                ch: selection.end.ch + 2,
              }
            );
            selection.start = {
              line: selection.start.line,
              ch: selection.start.ch - 2,
            };
            selection.end = {
              line: selection.end.line,
              ch: selection.end.ch + 2,
            };
          }
        }

        if (/~~(.*)~~/.test(selected)) {
          const plain = selected
            .replace(/^~~/, '') // remove starting ~~
            .replace(/~~$/, ''); // remove ending ~~
          doc.replaceSelection(plain);
          doc.setSelection(
            {
              line: selection.start.line,
              ch: selection.start.ch,
            },
            { line: selection.end.line, ch: selection.end.ch - 4 }
          );
          return;
        }
        if (selected.length > 0) {
          doc.replaceSelection(`~~${selected}~~`);
          doc.setSelection(
            {
              line: selection.start.line,
              ch: selection.start.ch,
            },
            { line: selection.end.line, ch: selection.end.ch + 4 }
          );
        }
      },
      blockquote: () => {
        const matches = /^> /.test(line);
        doc.setSelection(
          { line: cursor.line, ch: 0 },
          { line: cursor.line, ch: line.length }
        );
        if (matches) {
          doc.replaceSelection(line.replace(/^> /, ''));
          doc.setCursor({
            line: cursor.line,
            ch: cursor.ch - 2,
          });
        } else {
          doc.replaceSelection(`> ${line}`);
          doc.setCursor({
            line: cursor.line,
            ch: cursor.ch + 2,
          });
        }
      },
      link: () => {
        this.handleOpenAddLink();
      },
      image: () => {
        console.log('???');
        // this.props.onUpload();
      },
      codeblock: () => {
        const selected = doc.getSelection();
        if (selected.length === 0) {
          doc.replaceSelection('```\n코드를 입력하세요\n```');
          doc.setSelection(
            {
              line: cursor.line + 1,
              ch: 0,
            },
            {
              line: cursor.line + 1,
              ch: 9,
            }
          );
          return;
        }
        doc.replaceSelection(`\`\`\`
${selected}
\`\`\``);
      },
    };

    const handler = handlers[mode];
    if (!handler) return;

    handler();
    codemirror.focus();
  };

  render() {
    const { addLink } = this.state;

    return (
      <MarkdownEditorBlock ref={this.block} data-testid="codemirror">
        <div className="wrapper">
          <WriterHead hide={this.state.hideUpper}>
            <TitleTextarea
              placeholder="제목을 입력하세요."
              onChange={this.handleChangeTtitle}
              value={this.props.title}
            />
            <HorizontalBar />
            {this.props.tagInput}
          </WriterHead>
          <Toolbar
            shadow={this.state.hideUpper}
            mode="MARKDOWN"
            innerRef={this.toolbarElement}
            onClick={this.handleToolbarClick}
          />
          <MarkdownWrapper>
            {addLink.visible && (
              <AddLink
                defaultValue=""
                left={addLink.left}
                top={addLink.top}
                bottom={addLink.bottom}
                stickToRight={addLink.stickToRight}
                onConfirm={this.handleConfirmAddLink}
                onClose={this.handleCancelAddLink}
              />
            )}
            <textarea ref={this.editorElement} style={{ display: 'none' }} />
          </MarkdownWrapper>
        </div>

        <FooterWrapper style={{ width: '50%' }}>Footer</FooterWrapper>
      </MarkdownEditorBlock>
    );
  }
}

export default WriteMarkdownEditor;

const MarkdownEditorBlock = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
  position: relative;
  &::-webkit-scrollbar {
    border-radius: 3px;
    width: 6px;
    &:hover {
      width: 16px;
    }
    background: ${palette.gray1};
  }
  &::-webkit-scrollbar-thumb {
    z-index: 100;
    background: ${palette.gray9};
    /* -webkit-box-shadow: 0px 1px 2px rgba(0, 0, 0, 0.75); */
  }
  & > .wrapper {
    min-height: 0;
    padding-bottom: 4rem;
    flex: 1;
    display: flex;
    flex-direction: column;
  }
  .CodeMirror-lines {
    padding: 4px 0; /* Vertical padding around content */
    padding-bottom: 3rem;
  }
  .CodeMirror pre.CodeMirror-line,
  .CodeMirror pre.CodeMirror-line-like {
    padding: 0 3rem; /* Horizontal padding of content */
    ${mediaQuery(767)} {
      padding: 0 1rem;
    }
  }
  .CodeMirror {
    min-height: 0;
    flex: 1;
    font-size: 1.125rem;
    line-height: 1.5;
    color: ${palette.gray8};
    font-family: 'Fira Mono', monospace;
    /* font-family: source-code-pro, Menlo, Monaco, Consolas, 'Courier New', */
    .cm-header {
      line-height: 1.5;
      color: ${palette.gray9};
    }
    .cm-header-1 {
      font-size: 2.5rem;
    }
    .cm-header-2 {
      font-size: 2rem;
    }
    .cm-header-3 {
      font-size: 1.5rem;
    }
    .cm-header-4,
    .cm-header-5,
    .cm-header-6 {
      font-size: 1.3125rem;
    }
    .cm-strong,
    .cm-em {
      color: ${palette.gray9};
    }
    .CodeMirror-placeholder {
      color: ${palette.gray5};
      font-style: italic;
    }
    ${media.custom(767)} {
      font-size: 0.875rem;
      .cm-header-1 {
        font-size: 2rem;
      }
      .cm-header-2 {
        font-size: 1.5rem;
      }
      .cm-header-3 {
        font-size: 1.15rem;
      }
      .cm-header-4,
      .cm-header-5,
      .cm-header-6 {
        font-size: 1rem;
      }
    }
  }
`;

const HorizontalBar = styled.div`
  background: ${palette.gray7};
  height: 6px;
  width: 4rem;
  margin-top: 1.5rem;
  margin-bottom: 1rem;
  ${mediaQuery(767)} {
    margin-top: 1rem;
    margin-bottom: 0.66rem;
  }
  border-radius: 1px;
`;

const PaddingWrapper = styled.div`
  padding-top: 2rem;
  padding-left: 3rem;
  padding-right: 3rem;
  ${mediaQuery(767)} {
    padding: 1rem;
  }
`;

const MarkdownWrapper = styled.div`
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
`;

const FooterWrapper = styled.div`
  position: fixed;
  bottom: 0;
  width: 100%;
  z-index: ${zIndexes.WriteFooter};
`;

const removeHeading = (text: string) => {
  return text.replace(/#{1,6} /, '');
};

type CheckerKey = keyof typeof checker;

const checkEmbed = (text: string) => {
  const keys = Object.keys(checker) as CheckerKey[];
  for (let i = 0; i < keys.length; i += 1) {
    const key = keys[i];
    const fn = checker[keys[i]];
    const code = fn(text);
    if (code) {
      return `!${key}[${code}]`;
    }
  }
  return null;
};

const checker = {
  youtube: (text: string) => {
    const regex = /^<iframe.*src="https:\/\/www.youtube.com\/embed\/(.*?)".*<\/iframe>$/;
    const result = regex.exec(text);
    if (!result) return null;
    return result[1];
  },
  twitter: (text: string) => {
    if (!/^<blockquote class="twitter-tweet/.test(text)) return null;
    const regex = /href="(.*?)"/g;
    const links = [];
    let match = regex.exec(text);
    while (match) {
      links.push(match[1]);
      match = regex.exec(text);
    }
    const pathMatch = /twitter.com\/(.*?)\?/.exec(links[links.length - 1]);
    if (!pathMatch) return null;
    return pathMatch[1];
  },
  codesandbox: (text: string) => {
    const regex = /^<iframe.*src="https:\/\/codesandbox.io\/embed\/(.*?)".*<\/iframe>$/s;
    const result = regex.exec(text);
    if (!result) return null;
    return result[1];
  },
  codepen: (text: string) => {
    const regex = /^<iframe.*src="https:\/\/codepen.io\/(.*?)".*/;
    const result = regex.exec(text);
    console.log(result);
    if (!result) return null;
    return result[1];
  },
};
