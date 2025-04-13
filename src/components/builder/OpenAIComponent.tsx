import React, { useState } from 'react';
import OpenAI from "openai";
import { zodResponseFormat } from "openai/helpers/zod";
import { z } from "zod";
import { Box, Button, Container, TextField, Typography } from '@mui/material';

const CalendarEvent = z.object({
    React_LiveProvider_code_string: z.string(),
    code_description: z.string(),
});

const OpenAIComponent = ({defaultPrompt}) => {
  const [apiKey, setApiKey] = useState('');
  const [prompt, setPrompt] = useState(defaultPrompt);
  const [response, setResponse] = useState('');

  const handleApiKeyChange = (e) => {
    setApiKey(e.target.value);
  };

  const handlePromptChange = (e) => {
    setPrompt(e.target.value);
  };

  const handleSubmit = async () => {
    const openai = new OpenAI({ apiKey: apiKey, dangerouslyAllowBrowser: true});
    try {
        const completion = await openai.beta.chat.completions.parse({
        model: "gpt-4o-2024-08-06",
        messages: [
          { role: "system", content: "You are a React developer, create a react-live code string" },
          { role: "user", content: prompt || defaultPrompt }
        ],
        response_format: zodResponseFormat(CalendarEvent, "event")
      });
      console.log(completion);
      const React_LiveProvider_code_string = completion.choices[0].message.parsed.React_LiveProvider_code_string;
      localStorage.setItem("builderCode", React_LiveProvider_code_string);
      setResponse(React_LiveProvider_code_string);
    } catch (error) {
      console.error('Error fetching data:', error);
      setResponse('Error fetching data. Please try again.');
    }
  };

  return (
    <Container maxWidth="xl">
      <Box 
        display="flex" 
        flexDirection="column" 
        alignItems="center" 
        justifyContent="center"
        mt={4}
      >
        <Typography variant="h4" gutterBottom>
          OpenAI Event Extractor
        </Typography>
        <TextField
          label="Enter API Key"
          variant="outlined"
          value={apiKey}
          onChange={handleApiKeyChange}
          fullWidth
          margin="normal"
        />
        <TextField
          label="Enter your prompt"
          multiline
          rows={12}
          variant="outlined"
          value={prompt}
          defaultValue={defaultPrompt}
          onChange={handlePromptChange}
          fullWidth
          margin="normal"
        />
        <Button
          variant="contained"
          color="primary"
          onClick={handleSubmit}
          sx={{ mt: 2 }}
        >
          Submit
        </Button>
        <pre>
          {response}
        </pre>
      </Box>
    </Container>
  );
};

export default OpenAIComponent;
