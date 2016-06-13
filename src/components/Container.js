import React from 'react';
import Mobiledoc from 'mobiledoc-kit';

const EMPTY_MOBILEDOC = {
  version: "0.3.0",
  markups: [],
  atoms: [],
  cards: [],
  sections: []
};

const Container = React.createClass({
  childContextTypes: {
    linkOffsets: React.PropTypes.object,
    setLinkOffsets: React.PropTypes.func,
    addLink: React.PropTypes.func,
    activeMarkupTags: React.PropTypes.array,
    activeSectionTags: React.PropTypes.array
  },
  getDefaultProps() {
    return {
      autofocus: true,
      cards: [],
      serializeVersion: "0.3.0",
      spellcheck: true
    };
  },
  getInitialState() {
    return {
      activeMarkupTags: [],
      activeSectionTags: []
    };
  },
  getChildContext() {
    return {
      linkOffsets: this.state.linkOffsets,
      setLinkOffsets: (range) => this.setState({ linkOffsets: range }),
      addLink: this.addLink,
      activeMarkupTags: this.state.activeMarkupTags,
      activeSectionTags: this.state.activeSectionTags
    };
  },
  componentWillMount() {
    if (typeof this.props.willCreateEditor === 'function') {
      this.props.willCreateEditor();
    }

    const mobiledoc = this.props.mobiledoc || EMPTY_MOBILEDOC;
    const { autofocus, cards, placeholder, serializeVersion, spellcheck } = this.props;
    const editorOptions = { ...this.props.options, mobiledoc, autofocus, cards, placeholder, serializeVersion, spellcheck };
    this.editor = new Mobiledoc.Editor(editorOptions);

    this.editor.inputModeDidChange(this.setActiveTags);

    if (typeof this.props.onChange === 'function') {
      this.editor.postDidChange(() => {
        const mobiledoc = this.editor.serialize(this.props.serializeVersion);
        this.props.onChange(mobiledoc);
      });
    }

    if (typeof this.props.didCreateEditor === 'function') {
      this.props.didCreateEditor(this.editor);
    }
  },
  componentWillUnmount() {
    this.editor.destroy();
  },
  render() {
    const children = React.Children.map(this.props.children, (child) => {
      return React.cloneElement(child, {editor: this.editor});
    });
    return <div>{children}</div>;
  },
  addLink({href}) {
    this.editor.run(postEditor => {
      const markup = postEditor.builder.createMarkup('a', {href});
      postEditor.addMarkupToRange(this.state.linkOffsets, markup);
    });
  },
  setActiveTags() {
    this.setState({
      activeMarkupTags: this.editor.activeMarkups.map(m => m.tagName),
      // editor.activeSections are leaf sections.
      // Map parent section tag names (e.g. 'p', 'ul', 'ol') so that list buttons
      // are updated.
      activeSectionTags: this.editor.activeSections.map(s => {
        return s.isNested ? s.parent.tagName : s.tagName;
      })
    });
  }
});

export default Container;
