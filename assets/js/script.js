'use strict';

// --- Global Variables ---
let walletConnected = false;
let currentAccount = null;
const API_BASE = 'https://api.tungtungtung.art';

/**
 * PRELOADER - 开屏动画
 * 当DOM内容加载完成后，添加loaded类来触发动画
 */
const preloader = document.querySelector('[data-preloader]');

window.addEventListener('DOMContentLoaded', function () {
  preloader.classList.add('loaded');
  document.body.classList.add('loaded');

  // 只绑定Phantom钱包按钮
  const phantomBtn = document.getElementById('phantom-connect-btn');
  if (phantomBtn) {
    phantomBtn.addEventListener('click', connectPhantomWallet);
  }
  const phantomBtnMobile = document.getElementById('phantom-connect-btn-mobile');
  if (phantomBtnMobile) {
    phantomBtnMobile.addEventListener('click', connectPhantomWallet);
  }

  // 绑定断开按钮
  const logoutBtn = document.getElementById('logout-wallet');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', disconnectPhantomWallet);
  }
  const logoutBtnMobile = document.querySelector('.mobile-logout-btn');
  if (logoutBtnMobile) {
    logoutBtnMobile.addEventListener('click', disconnectPhantomWallet);
  }

  // 检查是否已有连接的钱包
  checkExistingPhantomConnection();
});

function checkExistingPhantomConnection() {
  const walletType = localStorage.getItem('connectedWallet');
  const walletAddress = localStorage.getItem('walletAddress');
  if (walletType === 'phantom' && walletAddress) {
    walletConnected = true;
    currentAccount = walletAddress;
    updatePhantomWalletUI(walletAddress);
  } else {
    resetWalletUI();
  }
}

function updatePhantomWalletUI(address) {
  const connectText = document.getElementById('wallet-connect-text');
  const addressDisplay = document.getElementById('wallet-address-display');
  const logoutBtn = document.getElementById('logout-wallet');
  if (connectText && addressDisplay && logoutBtn) {
    connectText.style.display = 'none';
    addressDisplay.style.display = 'inline';
    addressDisplay.textContent = `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
    logoutBtn.style.display = 'inline-block';
  }
  // 移动端
  const mobileStatus = document.querySelector('.mobile-connected-status');
  const mobileAddr = document.querySelector('.mobile-wallet-address');
  if (mobileStatus && mobileAddr) {
    mobileStatus.style.display = 'block';
    mobileAddr.textContent = `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  }
}

function resetWalletUI() {
  const connectText = document.getElementById('wallet-connect-text');
  const addressDisplay = document.getElementById('wallet-address-display');
  const logoutBtn = document.getElementById('logout-wallet');
  if (connectText && addressDisplay && logoutBtn) {
    connectText.style.display = 'inline';
    addressDisplay.style.display = 'none';
    logoutBtn.style.display = 'none';
  }
  // 移动端
  const mobileStatus = document.querySelector('.mobile-connected-status');
  const mobileAddr = document.querySelector('.mobile-wallet-address');
  if (mobileStatus && mobileAddr) {
    mobileStatus.style.display = 'none';
    mobileAddr.textContent = '';
  }
}

/**
 * 移动端导航栏控制
 * - 点击导航切换按钮时显示/隐藏导航菜单
 * - 点击导航链接时关闭导航菜单
 */
const navbar = document.querySelector('[data-navbar]');
const navTogglers = document.querySelectorAll('[data-nav-toggler]');
const navLinks = document.querySelectorAll('[data-nav-link]');
const overlay = document.querySelector('[data-overlay]');

// 点击导航切换按钮时的处理
const addEventOnElements = function (elements, eventType, callback) {
  for (let i = 0, len = elements.length; i < len; i++) {
    elements[i].addEventListener(eventType, callback);
  }
};

// 点击导航链接时的处理（关闭导航菜单）
addEventOnElements(navLinks, 'click', function () {
  navbar.classList.remove('active');
  overlay.classList.remove('active');
  document.body.classList.remove('nav-active');
});

/**
 * 头部滚动固定效果
 * 当页面滚动超过100px时，为头部添加active类，实现固定效果
 */
const header = document.querySelector('[data-header]');

window.addEventListener('scroll', function () {
  header.classList[window.scrollY > 100 ? 'add' : 'remove']('active');
});

/**
 * 元素倾斜效果
 * 通过鼠标移动位置计算倾斜角度，使用perspective和rotate实现3D效果
 */
const tiltElements = document.querySelectorAll('[data-tilt]');

/**
 * 初始化倾斜效果
 * @param {MouseEvent} event - 鼠标事件对象
 */
const initTilt = function (event) {
  // 获取元素中心位置
  const centerX = this.offsetWidth / 2;
  const centerY = this.offsetHeight / 2;

  // 计算倾斜角度（基于鼠标位置与中心点的偏移量）
  const tiltPosY = ((event.offsetX - centerX) / centerX) * 10;
  const tiltPosX = ((event.offsetY - centerY) / centerY) * 10;

  // 应用3D变换
  this.style.transform = `perspective(1000px) rotateX(${tiltPosX}deg) rotateY(${
    tiltPosY - tiltPosY * 2
  }deg)`;
};

// 鼠标移动时应用倾斜效果
addEventOnElements(tiltElements, 'mousemove', initTilt);

// 鼠标移出时重置倾斜效果
addEventOnElements(tiltElements, 'mouseout', function () {
  this.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg)`;
});

/**
 * 自定义光标效果
 * 实现鼠标跟随动画和交互元素悬停效果
 */

// 获取光标元素（点和轮廓）
const cursors = document.querySelectorAll('[data-cursor]');

// 获取所有需要特殊光标效果的交互元素
const hoveredElements = [
  ...document.querySelectorAll('button'),
  ...document.querySelectorAll('a'),
];

/**
 * 鼠标移动时更新自定义光标位置
 * - cursors[0]：光标中心点，立即跟随
 * - cursors[1]：光标外轮廓，延迟跟随产生拖尾效果
 */
window.addEventListener('mousemove', function (event) {
  const posX = event.clientX;
  const posY = event.clientY;

  // 更新光标中心点位置（立即跟随）
  cursors[0].style.left = `${posX}px`;
  cursors[0].style.top = `${posY}px`;

  // 更新光标外轮廓位置（延迟跟随，产生拖尾效果）
  setTimeout(function () {
    cursors[1].style.left = `${posX}px`;
    cursors[1].style.top = `${posY}px`;
  }, 80);
});

// 鼠标悬停在交互元素上时，添加hovered类
addEventOnElements(hoveredElements, 'mouseover', function () {
  for (let i = 0, len = cursors.length; i < len; i++) {
    cursors[i].classList.add('hovered');
  }
});

// 鼠标离开交互元素时，移除hovered类
addEventOnElements(hoveredElements, 'mouseout', function () {
  for (let i = 0, len = cursors.length; i < len; i++) {
    cursors[i].classList.remove('hovered');
  }
});

/**
 * AI 内容生成功能
 * 包含图片、视频和3D模型生成的API调用函数
 */

/**
 * 生成AI图片
 * 处理按钮状态并调用图片生成API
 */
function generateImage() {
  // 检查登录状态
  if (!walletConnected) {
    alert(
      'Please connect your wallet and verify your identity before using this feature'
    );
    return;
  }

  const btn = event.target;
  btn.disabled = true;
  btn.innerHTML =
    '<span class="status-indicator processing"></span> Generating...';

  // Get user input from the input field
  const userPrompt = document.getElementById('imagePromptInput').value.trim();
  const imageSize = document.getElementById('imageSizeSelect').value;

  // If no prompt is entered, show error and stop
  if (!userPrompt) {
    document.getElementById('imageError').textContent =
      'Please enter an image generation prompt';
    document.getElementById('imageError').style.display = 'block';
    btn.disabled = false;
    btn.textContent = 'Generate Image';
    return;
  }

  // Show loading state
  document.getElementById('imageLoading').style.display = 'block';
  document.getElementById('imageError').style.display = 'none';

  fetch(`${API_BASE}/generate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({
      prompt: userPrompt,
      style: 'artistic',
      size: imageSize,
    }),
  })
    .then((response) => {
      if (response.status === 401) {
        // 如果是401，直接抛出特定错误
        throw new Error('Unauthorized: 401');
      }
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .then((data) => {
      console.log('Image generated:', data);
      const imageUrl = data.output?.images?.[0]?.url;

      if (imageUrl) {
        // 直接更新卡片中的图片
        const imageElement = document.getElementById('ai-creation-image');
        if (imageElement) {
          imageElement.src = imageUrl;
        } else {
          console.error(
            'Could not find the image element with ID: ai-creation-image'
          );
          alert('Image generated, but could not display it on the page.');
        }

        // (Optional) Keep automatic download if desired
        // downloadImageAutomatically(imageUrl);
      } else {
        console.error(
          'API did not return an image URL. Server response:',
          data
        );
        alert(
          'Failed to get image URL. Please check the browser console for more details.'
        );
      }
    })
    .catch((error) => {
      console.error('Image Generation Failed:', error);
      document.getElementById('imageLoading').style.display = 'none';
      // 检查是否为401未授权错误
      if (error.message && error.message.includes('401')) {
        document.getElementById('imageError').textContent =
          'Please connect your wallet to use this feature';
      } else if (error instanceof TypeError) {
        // 网络或CORS错误
        document.getElementById('imageError').textContent =
          'Image generation failed, network or CORS error occurred. Please check the browser console for details.';
      } else {
        // 其他服务器错误
        document.getElementById(
          'imageError'
        ).textContent = `Image generation failed, server returned error: ${error.message}. Please check the console for details.`;
      }
      document.getElementById('imageError').style.display = 'block';
    })
    .finally(() => {
      // Restore button state
      document.getElementById('imageLoading').style.display = 'none';
      btn.disabled = false;
      btn.textContent = 'Generate Image';
    });
}

/**
 * 手动下载图片
 */
function downloadImage() {
  if (window.currentImageUrl) {
    downloadImageAutomatically(window.currentImageUrl);
  }
}

/**
 * 自动下载图片
 * @param {string} imageUrl - 图片URL
 */
function downloadImageAutomatically(imageUrl) {
  // 创建一个临时的a标签来触发下载
  const link = document.createElement('a');
  link.href = imageUrl;
  link.download = `ai-generated-image-${Date.now()}.jpg`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Generate AI Video
 * Handle button state and call video generation API
 */
function generateVideo() {
  // 检查登录状态
  if (!walletConnected) {
    alert(
      'Please connect your wallet and verify your identity before using this feature'
    );
    return;
  }

  const btn = event.target;
  btn.disabled = true;
  btn.textContent = 'Generating...';

  // Get user input from the input field
  const userPrompt = document.getElementById('videoPromptInput').value.trim();
  const videoSize = document.getElementById('videoSizeSelect').value;

  // If no prompt is entered, show error and stop
  if (!userPrompt) {
    document.getElementById('videoError').textContent =
      'Please enter a video generation prompt';
    document.getElementById('videoError').style.display = 'block';
    btn.disabled = false;
    btn.textContent = 'Generate Video';
    return;
  }

  // Show loading state
  document.getElementById('videoLoading').style.display = 'block';
  document.getElementById('videoError').style.display = 'none';

  // Call local server API to submit video generation task
  fetch(`${API_BASE}/generate_video`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include', // 确保请求携带认证cookie
    body: JSON.stringify({
      prompt: userPrompt,
      duration: 3, // Set shorter duration to avoid long generation time
      resolution: videoSize, // Use user selected resolution
    }),
  })
    .then((response) => response.json())
    .then((data) => {
      console.log('Video generation task submitted:', data);
      if (data.task_id) {
        // Display task ID and start polling task status
        document.getElementById(
          'videoLoading'
        ).textContent = `Video generation task submitted, task ID: ${data.task_id}. Generation may take some time, please be patient.`;
        // You can add code here to periodically check task status
        checkVideoTaskStatus(data.task_id, btn);
      } else {
        document.getElementById('videoLoading').style.display = 'none';
        document.getElementById('videoError').textContent =
          'Failed to submit video generation task, please try again.';
        document.getElementById('videoError').style.display = 'block';
        btn.disabled = false;
        btn.textContent = 'Generate Video';
      }
    })
    .catch((error) => {
      console.error('Error submitting video generation task:', error);
      document.getElementById('videoLoading').style.display = 'none';
      // 检查是否为401未授权错误
      if (error.message && error.message.includes('401')) {
        document.getElementById('videoError').textContent =
          'Please connect your wallet to use this feature';
      } else {
        document.getElementById('videoError').textContent =
          'Failed to submit video generation task, please try again.';
      }
      document.getElementById('videoError').style.display = 'block';
      btn.disabled = false;
      btn.textContent = 'Generate Video';
    });
}

/**
 * Check video generation task status
 * @param {string} taskId - Task ID
 * @param {HTMLElement} btn - Button element, used to restore state
 */
function checkVideoTaskStatus(taskId, btn) {
  // Set polling interval (milliseconds)
  const pollingInterval = 3000;

  // Create polling function
  const pollStatus = () => {
    fetch(`${API_BASE}/task/${taskId}`, {
      credentials: 'include',
    })
      .then((response) => response.json())
      .then((data) => {
        console.log('Task status:', data);

        if (data.status === 'completed') {
          // Task completed, show results
          clearInterval(pollingId); // Stop polling

          const videoUrl = data.result?.video_url;

          if (videoUrl) {
            const videoElement = document.getElementById('ai-creation-video');
            if (videoElement) {
              videoElement.src = videoUrl;
              videoElement.load();
              videoElement.play();
              document.getElementById('videoLoading').style.display = 'none';
            } else {
              console.error(
                'Could not find video element with ID: ai-creation-video'
              );
              document.getElementById('videoLoading').style.display = 'none';
              document.getElementById('videoError').textContent =
                'Video generated, but could not display it on the page.';
              document.getElementById('videoError').style.display = 'block';
            }
          } else {
            document.getElementById('videoLoading').style.display = 'none';
            document.getElementById(
              'videoError'
            ).textContent = `Video generation completed, but no video URL was found. Response: ${JSON.stringify(
              data
            )}`;
            document.getElementById('videoError').style.display = 'block';
          }

          // Restore button state
          document.getElementById('videoLoading').style.display = 'none';
          btn.disabled = false;
          btn.textContent = 'Generate Video';
        } else if (data.status === 'failed') {
          // Task failed
          clearInterval(pollingId); // Stop polling
          document.getElementById('videoLoading').style.display = 'none';
          document.getElementById(
            'videoError'
          ).textContent = `Video generation failed: ${
            data.error || 'Unknown error'
          }`;
          document.getElementById('videoError').style.display = 'block';
          btn.disabled = false;
          btn.textContent = 'Generate Video';
        } else {
          // Task still processing, continue polling
          console.log('Video still processing...');
        }
      })
      .catch((error) => {
        console.error('Error checking task status:', error);
        clearInterval(pollingId); // Stop polling
        document.getElementById('videoLoading').style.display = 'none';
        document.getElementById('videoError').textContent =
          'Failed to check task status. Please manually check task ID: ' +
          taskId;
        document.getElementById('videoError').style.display = 'block';
        btn.disabled = false;
        btn.textContent = 'Generate Video';
      });
  };

  // Start polling
  const pollingId = setInterval(pollStatus, pollingInterval);

  // 立即执行一次
  pollStatus();
}

/**
 * AI语言问答功能
 * 处理按钮状态并调用AI问答API
 */
function generate3DModel() {
  const btn = event.target;
  btn.disabled = true;
  btn.textContent = 'Thinking...';

  // 重置显示区域
  resetQADisplay();

  // Get user input question, use default value if none provided
  const userQuestion =
    prompt('Please enter your question:', 'What can AI help us with?') ||
    'What can AI help us with?';

  // 调用本地服务器API
  fetch(`${API_BASE}/generate_qwen`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      prompt: userQuestion,
      voice: 'Cherry', // 使用默认语音
    }),
  })
    .then((response) => response.json())
    .then((data) => {
      console.log('AI Q&A Response:', data);
      if (data.text && data.audio_url) {
        // 直接使用后端返回的完整音频URL
        showQAResult(userQuestion, data.text, data.audio_url);
      } else {
        alert('Unable to get AI response, please try again.');
      }
    })
    .catch((error) => {
      console.error('AI Q&A request failed:', error);
      alert(
        'AI Q&A service is temporarily unavailable, please try again later.'
      );
    })
    .finally(() => {
      // 恢复按钮状态
      btn.disabled = false;
      btn.textContent = 'Start Q&A';
    });
}

/**
 * 重置问答显示区域
 */
function resetQADisplay() {
  const qaDisplayArea = document.getElementById('qaDisplayArea');
  const qaPlaceholder = qaDisplayArea.querySelector('.qa-placeholder');
  const qaContent = document.getElementById('qaContent');

  // 显示占位符
  qaPlaceholder.style.display = 'block';

  // 隐藏问答内容
  qaContent.style.display = 'none';
}

/**
 * 显示问答结果
 * @param {string} question - 用户问题
 * @param {string} answer - AI回答
 * @param {string} audioUrl - 音频URL（可选）
 */
function showQAResult(question, answer, audioUrl = null) {
  console.log('Inside showQAResult, received audioUrl:', audioUrl); // 增加日志，用于调试
  // 获取显示区域元素
  const qaDisplayArea = document.getElementById('qaDisplayArea');
  const qaPlaceholder = qaDisplayArea.querySelector('.qa-placeholder');
  const qaContent = document.getElementById('qaContent');
  const displayQuestion = document.getElementById('displayQuestion');
  const displayAnswer = document.getElementById('displayAnswer');

  // 隐藏占位符
  qaPlaceholder.style.display = 'none';

  // 设置问题和回答内容
  displayQuestion.textContent = question;
  displayAnswer.textContent = answer;

  // 显示问答内容
  qaContent.style.display = 'block';

  // 添加复制功能到回答区域
  displayAnswer.style.cursor = 'pointer';
  displayAnswer.title = 'Click to copy answer';
  displayAnswer.onclick = function () {
    copyToClipboard(answer);
  };

  // 添加语音播放功能
  addAudioControls(qaContent, answer, audioUrl);

  // 滚动到问答区域
  qaDisplayArea.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

/**
 * 添加语音播放控件
 * @param {HTMLElement} container - 容器元素
 * @param {string} text - 要转换为语音的文本
 * @param {string} audioUrl - 音频URL（可选）
 */
function addAudioControls(container, text, audioUrl = null) {
  // 移除已存在的音频控件
  const existingAudio = container.querySelector('.qa-audio-controls');
  if (existingAudio) {
    existingAudio.remove();
  }

  // 只在提供了audioUrl时才创建播放器
  if (audioUrl) {
    const audioContainer = document.createElement('div');
    audioContainer.className = 'qa-audio-controls';

    const audioLabel = document.createElement('div');
    audioLabel.textContent = '🔊 Voice Answer:';
    audioLabel.style.marginTop = '10px';
    audioLabel.style.fontWeight = 'bold';
    audioLabel.style.color = '#d4af37';

    const audio = document.createElement('audio');
    audio.controls = true;
    audio.autoplay = true; // 尝试自动播放
    audio.src = audioUrl; // 直接使用完整的后端URL
    audio.style.width = '100%';
    audio.style.marginTop = '10px';

    // 尝试自动播放，如果失败，则需要用户手动交互
    audio.play().catch((error) => {
      console.log('Autoplay was prevented:', error);
      audioLabel.textContent = '🔊 Voice Answer (Click to play)';
    });

    audioContainer.appendChild(audioLabel);
    audioContainer.appendChild(audio);
    container.appendChild(audioContainer);
  }
}

/**
 * 复制文本到剪贴板
 * @param {string} text - 要复制的文本
 */
function copyToClipboard(text) {
  navigator.clipboard
    .writeText(text)
    .then(() => {
      alert('Answer copied to clipboard!');
    })
    .catch(() => {
      // 降级方案
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      alert('Answer copied to clipboard!');
    });
}

/**
 * 生成语音问答
 * 参考后端模板实现的音频播放功能
 */
function generateChatAudio() {
  // 检查登录状态
  if (!walletConnected) {
    alert(
      'Please connect your wallet and verify your identity before using this feature'
    );
    return;
  }

  const question = document.getElementById('qaQuestionInput').value.trim();
  const selectedVoiceValue = document.getElementById('qaVoiceSelect').value;
  const voice = selectedVoiceValue.split(' ')[0]; // Extract only the name, e.g., "Chelsie"
  const streamPlayback = document.getElementById('streamPlayback').checked;

  if (!question) {
    alert('Please enter your question');
    return;
  }

  document.getElementById('qaLoading').style.display = 'block';
  document.getElementById('qaError').style.display = 'none';
  document.getElementById('qaContent').style.display = 'none';
  document.getElementById('qaStreamingContent').style.display = 'none';

  // 执行功能
  if (streamPlayback) {
    // Use streaming mode (real-time playback)
    streamChatAudio(question, voice);
  } else {
    // Use non-streaming mode
    fetchChatAudio(question, voice);
  }
}

/**
 * 流式音频播放
 * @param {string} question - 用户问题
 * @param {string} voice - 选择的语音
 */
function streamChatAudio(question, voice) {
  // 显示流式内容区域
  const streamingContent = document.getElementById('qaStreamingContent');
  streamingContent.style.display = 'block';

  // 清空之前的内容
  document.getElementById('streamingTextContent').textContent = '';
  document.getElementById('streamingStatus').innerHTML =
    '<span class="status-indicator processing"></span> Generating answer...';

  // 编码问题参数
  const params = new URLSearchParams({
    question: question,
    voice: voice,
    stream_mode: true,
  }).toString();

  // 连接服务器发送的事件流
  const source = new EventSource(
    `${API_BASE}/generate_chat_audio?${params}`,
    { withCredentials: true }
  );

  // 保存累计的文本和音频URL
  let accumulatedText = '';
  let fullAudioUrl = '';

  // 处理服务器发送的消息
  source.onmessage = function (event) {
    try {
      const data = JSON.parse(event.data);
      console.log('Received SSE event:', data);

      if (data.status === 'text') {
        // 更新文本内容
        accumulatedText += data.content;
        document.getElementById('streamingTextContent').textContent =
          accumulatedText;
      } else if (data.status === 'audio_segment') {
        // 音频片段信息，可以更新进度状态
        document.getElementById(
          'streamingStatus'
        ).innerHTML = `<span class="status-indicator processing"></span> Received audio segment ${data.segment_id}...`;
      } else if (data.status === 'complete') {
        // 接收完整的音频URL和文本
        fullAudioUrl = data.full_audio_url;

        // 如果服务器返回了完整文本，使用服务器返回的文本
        if (data.full_text) {
          accumulatedText = data.full_text;
        }

        // 确保总是有文本显示
        if (!accumulatedText || accumulatedText.trim() === '') {
          accumulatedText =
            'Thank you for your question. Please listen to the audio answer.';
        }

        // 更新显示
        document.getElementById('streamingTextContent').textContent =
          accumulatedText;

        // 设置音频源并播放
        if (fullAudioUrl) {
          const audioElement = document.getElementById('streamingAudio');
          audioElement.src = fullAudioUrl;
          audioElement.load(); // 确保加载新的音频

          // 添加音频加载事件监听
          audioElement.addEventListener(
            'canplaythrough',
            function () {
              audioElement.play().catch((e) => {
                console.error('Auto-play failed:', e);
                document.getElementById('streamingStatus').innerHTML +=
                  '<br>Please click the play button to listen to the answer';
              });
            },
            { once: true }
          );
        }

        // 更新状态
        document.getElementById(
          'streamingStatus'
        ).innerHTML = `<span class="status-indicator completed"></span> Answer completed`;

        // 关闭连接
        source.close();

        // 隐藏加载提示
        document.getElementById('qaLoading').style.display = 'none';
      } else if (data.status === 'error') {
        // 处理错误
        document.getElementById(
          'qaError'
        ).textContent = `Error: ${data.message}`;
        document.getElementById('qaError').style.display = 'block';
        source.close();
        document.getElementById('qaLoading').style.display = 'none';
      }
    } catch (e) {
      console.error('Failed to parse server message:', e, event.data);
    }
  };

  // 处理错误
  source.onerror = function (event) {
    console.error('EventSource connection error:', event);
    document.getElementById('qaError').textContent = 'Server connection error';
    document.getElementById('qaError').style.display = 'block';
    document.getElementById('qaLoading').style.display = 'none';
    source.close();
  };
}

/**
 * 非流式音频获取
 * @param {string} question - 用户问题
 * @param {string} voice - 选择的语音
 */
function fetchChatAudio(question, voice) {
  fetch(`${API_BASE}/generate_chat_audio`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      question: question,
      voice: voice,
    }),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.error) {
        document.getElementById('qaLoading').style.display = 'none';
        document.getElementById('qaError').textContent = data.error;
        document.getElementById('qaError').style.display = 'block';
        return;
      }

      if (data.task_id) {
        checkChatStatus(data.task_id, question);
      } else {
        document.getElementById('qaLoading').style.display = 'none';
        document.getElementById('qaError').textContent =
          'Unable to get task information';
        document.getElementById('qaError').style.display = 'block';
      }
    })
    .catch((error) => {
      document.getElementById('qaLoading').style.display = 'none';
      document.getElementById('qaError').textContent =
        'Request failed: ' + error;
      document.getElementById('qaError').style.display = 'block';
    });
}

/**
 * 检查聊天任务状态
 * @param {string} taskId - 任务ID
 * @param {string} question - 用户问题
 */
function checkChatStatus(taskId, question) {
  document.getElementById(
    'qaLoading'
  ).textContent = `Querying task status... (Task ID: ${taskId})`;

  // 轮询任务状态
  const checkInterval = setInterval(() => {
    fetch(`${API_BASE}/task/${taskId}`)
      .then((response) => response.json())
      .then((data) => {
        if (data.status === 'completed') {
          clearInterval(checkInterval);
          document.getElementById('qaLoading').style.display = 'none';
          if (data.result && data.result.audio_url) {
            showChatResult(data.result.audio_url, data.result.text, question);
          } else {
            document.getElementById('qaError').textContent =
              'Unable to get audio URL';
            document.getElementById('qaError').style.display = 'block';
          }
        } else if (data.status === 'failed') {
          clearInterval(checkInterval);
          document.getElementById('qaLoading').style.display = 'none';
          document.getElementById(
            'qaError'
          ).textContent = `Audio generation failed: ${
            data.error || 'Unknown error'
          }`;
          document.getElementById('qaError').style.display = 'block';
        } else {
          // 继续等待
        }
      })
      .catch((error) => {
        clearInterval(checkInterval);
        document.getElementById('qaLoading').style.display = 'none';
        document.getElementById('qaError').textContent =
          'Failed to query task status: ' + error;
        document.getElementById('qaError').style.display = 'block';
      });
  }, 2000); // 每2秒检查一次
}

/**
 * 显示聊天结果
 * @param {string} audioUrl - 音频URL
 * @param {string} text - 回答文本
 * @param {string} question - 用户问题
 */
function showChatResult(audioUrl, text, question) {
  // 显示问答内容区域
  const qaContent = document.getElementById('qaContent');
  qaContent.style.display = 'block';

  // 设置问题和回答
  document.getElementById('displayQuestion').textContent = question;
  document.getElementById('displayAnswer').textContent = text;

  if (audioUrl) {
    const audio = document.getElementById('qaAudio');
    const audioSource = document.getElementById('qaAudioSource');

    // Directly use the full backend URL to prevent 404 errors.
    audioSource.src = audioUrl;
    audio.style.display = 'block';

    // 尝试自动播放
    audio.load();
    audio.addEventListener(
      'canplaythrough',
      function () {
        audio.play().catch((e) => {
          console.error('Auto-play failed:', e);
          document.getElementById('qaAudioStatus').textContent =
            'Please click the play button to listen to the answer';
        });
      },
      { once: true }
    );
  }
}

/**
 * 路线图详情切换功能
 * 控制路线图详情的显示和隐藏
 */
function toggleRoadmapDetails() {
  const details = document.getElementById('roadmapDetails');
  if (details.style.display === 'none') {
    details.style.display = 'block';
  } else {
    details.style.display = 'none';
  }
}

/**
 * 钱包连接功能
 */

// 钱包连接配置
const walletConfig = {
  metamask: {
    name: 'MetaMask',
    chainId: '0x1', // 以太坊主网
    rpcUrl: 'https://mainnet.infura.io/v3/YOUR_PROJECT_ID',
  },
  okx: {
    name: 'OKX Wallet',
    chainId: '0x1', // 以太坊主网
    rpcUrl: 'https://mainnet.infura.io/v3/YOUR_PROJECT_ID',
  },
};

/**
 * 连接MetaMask钱包
 */
async function connectMetaMask() {
  try {
    if (typeof window.ethereum !== 'undefined') {
      // 请求连接钱包
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });

      if (accounts.length > 0) {
        console.log('MetaMask connected:', accounts[0]);
        currentAccount = accounts[0];

        // 显示钱包验证模态框
        const walletModal = document.getElementById('wallet-modal');
        if (walletModal) {
          walletModal.style.display = 'block';
        }
      }
    } else {
      alert('MetaMask is not installed. Please install MetaMask extension.');
      window.open('https://metamask.io/download/', '_blank');
    }
  } catch (error) {
    console.error('Error connecting to MetaMask:', error);
    alert('Failed to connect to MetaMask. Please try again.');
  }
}

/**
 * 连接OKX钱包
 */
async function connectOKXWallet() {
  try {
    if (typeof window.okxwallet !== 'undefined') {
      // 请求连接OKX钱包
      const accounts = await window.okxwallet.request({
        method: 'eth_requestAccounts',
      });

      if (accounts.length > 0) {
        console.log('OKX Wallet connected:', accounts[0]);
        currentAccount = accounts[0];

        // 显示钱包验证模态框
        const walletModal = document.getElementById('wallet-modal');
        if (walletModal) {
          walletModal.style.display = 'block';
        }
      }
    } else {
      alert(
        'OKX Wallet is not installed. Please install OKX Wallet extension.'
      );
      window.open('https://www.okx.com/web3', '_blank');
    }
  } catch (error) {
    console.error('Error connecting to OKX Wallet:', error);
    alert('Failed to connect to OKX Wallet. Please try again.');
  }
}

/**
 * 连接Phantom（Solana）钱包
 */
async function connectPhantomWallet() {
  try {
    if (!window.solana || !window.solana.isPhantom) {
      alert('请安装 Phantom 钱包');
      window.open('https://phantom.app/', '_blank');
      return;
    }

    // 请求连接钱包
    const response = await window.solana.connect();
    const publicKey = response.publicKey.toString();
    
    // 获取 nonce
    const nonceResponse = await fetch(`${API_BASE}/get_nonce`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        wallet_address: publicKey
      })
    });
    const nonceData = await nonceResponse.json();
    if (!nonceResponse.ok) {
      throw new Error(nonceData.error || '获取 nonce 失败');
    }

    // 构造签名消息
    const message = `Please sign this message to verify your identity.\n\nNonce: ${nonceData.nonce}`;
    const encodedMessage = new TextEncoder().encode(message);
    const signedMessage = await window.solana.signMessage(encodedMessage, 'utf8');
    const signature = btoa(String.fromCharCode(...signedMessage.signature));

    // 获取邀请码（如果有）
    const inviteCode = sessionStorage.getItem('invite_code');

    // 验证签名
    const verifyResponse = await fetch(`${API_BASE}/verify_signature`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        wallet_address: publicKey,
        signature: signature,
        message: message,
        invite_code: inviteCode
      })
    });
    const verifyData = await verifyResponse.json();
    if (!verifyResponse.ok) {
      throw new Error(verifyData.error || '签名验证失败');
    }

    // 连接成功
    walletConnected = true;
    currentAccount = publicKey;
    onWalletConnected('phantom', publicKey);

    // 清除已使用的邀请码
    if (inviteCode) {
      sessionStorage.removeItem('invite_code');
    }

    // 显示积分奖励信息
    if (verifyData.points_earned > 0) {
      alert(`${verifyData.message} 当前总积分: ${verifyData.total_points}`);
    } else {
      alert('Phantom 钱包连接成功！');
    }
  } catch (error) {
    console.error('连接Phantom钱包失败:', error);
    alert(`连接失败: ${error.message}`);
  }
}

/**
 * 断开Phantom钱包连接
 */
async function disconnectPhantomWallet() {
  try {
    if (window.solana && window.solana.isPhantom) {
      await window.solana.disconnect();
    }
    walletConnected = false;
    currentAccount = null;
    resetWalletUI();
    alert('已断开Phantom钱包连接');
  } catch (error) {
    console.error('断开Phantom钱包失败:', error);
    alert(`断开连接失败: ${error.message}`);
  }
}

/**
 * 钱包连接成功后的回调函数
 * @param {string} walletType - 钱包类型 ('metamask' 或 'okx')
 * @param {string} address - 钱包地址
 */
function onWalletConnected(walletType, address) {
  localStorage.setItem('connectedWallet', walletType);
  localStorage.setItem('walletAddress', address);
  updateWalletUI(walletType, address);
  // 这里可以添加其他连接成功后的逻辑
  console.log(`Wallet connected: ${walletType}, Address: ${address}`);
  // UI显示
  const walletBtn = document.querySelector('.wallet-main-btn');
  if (walletBtn) {
    const shortAddress = `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
    walletBtn.innerHTML = `<span>🔗 ${shortAddress}</span>`;
  }
  // 显示登出按钮
  const logoutBtn = document.getElementById('logout-wallet');
  if (logoutBtn) {
    logoutBtn.style.display = 'inline-block';
    logoutBtn.onclick = () => {
      if (walletType === 'phantom') {
        disconnectPhantomWallet();
      } else {
        disconnectWallet();
      }
    };
  }
}

/**
 * 更新钱包连接状态的UI
 * @param {string} walletType - 钱包类型
 * @param {string} address - 钱包地址
 */
function updateWalletUI(walletType, address) {
  const walletBtn = document.querySelector('.wallet-btn');
  if (walletBtn) {
    const shortAddress = `${address.substring(0, 6)}...${address.substring(
      38
    )}`;
    walletBtn.innerHTML = `
      <span>🔗 ${shortAddress}</span>
      <span class="dropdown-arrow">▼</span>
    `;
  }
}

/**
 * 断开钱包连接
 */
function disconnectWallet() {
  localStorage.removeItem('connectedWallet');
  localStorage.removeItem('walletAddress');

  const walletBtn = document.querySelector('.wallet-btn');
  if (walletBtn) {
    walletBtn.innerHTML = `
      Connect wallet
      <span class="dropdown-arrow">▼</span>
    `;
  }

  console.log('Wallet disconnected');
  alert('Wallet disconnected successfully!');
}

/**
 * 生态系统应用相关功能
 */

// API接口配置
const ecosystemConfig = {
  baseUrl: 'https://api.tungtungtung.art', // 替换为实际的API地址
  endpoints: {
    '3d-model': '/ecosystem/3d-model',
    'digital-pet': '/ecosystem/digital-pet',
    'digital-avatar': '/ecosystem/digital-avatar',
  },
};

/**
 * Handle ecosystem application action
 * @param {string} appType - Application type, such as '3d-model', 'digital-pet', etc.
 */
async function handleEcosystemAction(appType) {
  try {
    // Show loading state
    const button = event.target;
    const originalText = button.textContent;
    button.textContent = 'Loading...';
    button.disabled = true;

    // Build API request URL
    const apiUrl = API_CONFIG.baseUrl + API_CONFIG.endpoints[appType];

    // Simulate API call (replace with actual API request when in use)
    console.log(`Calling API: ${apiUrl}`);

    // You can add actual API call logic here
    // const response = await fetch(apiUrl, {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify({ action: 'access', appType: appType })
    // });

    // Simulate delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Show development in progress message
    alert(
      `${getAppName(
        appType
      )} is currently under development. Stay tuned for updates!`
    );
  } catch (error) {
    console.error('API call failed:', error);
    alert('Service temporarily unavailable. Please try again later.');
  } finally {
    // Restore button state
    button.textContent = originalText;
    button.disabled = false;
  }
}

/**
 * Get application name
 * @param {string} appType - Application type
 * @returns {string} Application name
 */
function getAppName(appType) {
  const appNames = {
    '3d-model': 'AI 3D Model Generator',
    'digital-pet': 'AI Digital Pet Life',
    'digital-avatar': 'AI Avatar Generator',
  };
  return appNames[appType] || 'Application';
}

// Document ready event handler
document.addEventListener('DOMContentLoaded', function () {
  // Initialize preloader
  const preloader = document.querySelector('[data-preloader]');
  preloader.classList.add('loaded');
  document.body.classList.add('loaded');

  // You can add other initialization logic here
  // For example: check API status, load user preferences, etc.
});
