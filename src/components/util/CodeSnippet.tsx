import React, { useState } from 'react';
import { Box, Button, Snackbar, IconButton } from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { materialDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

const CodeSnippet = ({ code }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    setCopied(true);
  };

  const handleClose = () => {
    setCopied(false);
  };

  return (
    <Box position="relative" width="100%">
      <SyntaxHighlighter language="javascript" style={materialDark} customStyle={{ paddingLeft: '3.5em', width: '100%', whiteSpace: 'pre-wrap', fontSize: "0.8em"  }}>
        {code}
      </SyntaxHighlighter>
      <Box position="absolute" 
      top="50%"
      left={0}
      sx={{ transform: 'translateY(-50%)', display: 'flex', alignItems: 'center' }}
      >
        <CopyToClipboard text={code} onCopy={handleCopy}>
          <IconButton sx={{ color: 'white', transform: 'scale(1.1)' }}>
            <ContentCopyIcon />
          </IconButton>
        </CopyToClipboard>
      </Box>
      <Snackbar
        open={copied}
        autoHideDuration={3000}
        onClose={handleClose}
        message="Code copied!"
      />
    </Box>
  );
};

export default CodeSnippet;