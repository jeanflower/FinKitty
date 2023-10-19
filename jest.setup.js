// Learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom'
import next from 'next'; // https://github.com/vercel/next.js/discussions/13678 for 'fetch is not defined'

import { TextEncoder, TextDecoder } from 'util'
global.TextEncoder = TextEncoder
global.TextDecoder = TextDecoder

