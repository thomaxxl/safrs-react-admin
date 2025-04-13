import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { materialDark } from 'react-syntax-highlighter/dist/esm/styles/prism';


const CodeSnippet = ({ code }: { code: string }) => {
    return (
        <SyntaxHighlighter
            language="python"
            wrapLongLines
            style={materialDark}
            customStyle={{ paddingLeft: '0.5em', width: '96%', whiteSpace: 'pre-wrap', fontSize: "0.8em" }}
        >
            {code}
        </SyntaxHighlighter>
    );
};

export default CodeSnippet;