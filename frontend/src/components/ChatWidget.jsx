import { useState, useRef, useEffect } from 'react';
import './ChatWidget.css';

const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: 'Xin chào! 👋 Tôi là trợ lý ảo của Devialet Store. Tôi có thể giúp gì cho bạn?',
      sender: 'bot',
      timestamp: new Date(),
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const userMessage = {
      id: Date.now(),
      text: inputMessage,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    // Simulate AI response (có thể thay bằng API call)
    setTimeout(() => {
      const botResponse = {
        id: Date.now() + 1,
        text: getBotResponse(inputMessage),
        sender: 'bot',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, botResponse]);
      setIsTyping(false);
    }, 1000);
  };

  const getBotResponse = (message) => {
    const lowerMessage = message.toLowerCase();
    
    // Greeting
    if (lowerMessage.match(/^(hi|hello|chào|xin chào|hey)/)) {
      return 'Xin chào! Tôi có thể giúp gì cho bạn hôm nay? 😊';
    }
    
    // Product inquiries
    if (lowerMessage.includes('sản phẩm') || lowerMessage.includes('product') || lowerMessage.includes('có gì') || lowerMessage.includes('bán gì')) {
      return 'Chúng tôi chuyên về thiết bị âm thanh cao cấp Devialet:\n🔊 Loa không dây\n🎧 Tai nghe\n📻 Amplifier\n\nBạn quan tâm loại nào?';
    }
    
    // Price inquiries - More flexible matching
    if (lowerMessage.match(/giá|bao nhiêu|price|cost|tiền|đắt|rẻ|mắc/)) {
      return 'Giá sản phẩm của chúng tôi:\n\n💰 Loa Phantom: 45-120 triệu\n💰 Tai nghe Gemini: 8-15 triệu\n💰 Amplifier: 30-80 triệu\n\nBạn muốn biết chi tiết sản phẩm nào?';
    }
    
    // Specific product mentions
    if (lowerMessage.match(/phantom|loa/)) {
      return 'Loa Devialet Phantom là dòng sản phẩm cao cấp:\n\n🎵 Phantom I: 45 triệu\n🎵 Phantom II: 85 triệu\n🎵 Phantom Premier: 120 triệu\n\nÂm thanh cực kỳ sống động!';
    }
    
    if (lowerMessage.match(/gemini|tai nghe|headphone|earphone/)) {
      return 'Tai nghe Devialet Gemini:\n\n🎧 Chống ồn chủ động ANC\n🎧 Pin 24 giờ\n🎧 Giá: 8-15 triệu\n\nChất lượng âm thanh đỉnh cao!';
    }
    
    // Shipping
    if (lowerMessage.match(/giao hàng|ship|vận chuyển|nhận hàng|delivery/)) {
      return '🚚 Giao hàng toàn quốc:\n\n✅ Nội thành HN/HCM: 1-2 ngày\n✅ Tỉnh thành khác: 2-5 ngày\n✅ Miễn phí ship đơn > 5 triệu\n✅ Kiểm tra hàng trước khi nhận';
    }
    
    // Payment
    if (lowerMessage.match(/thanh toán|payment|trả tiền|pay|cod|chuyển khoản|vietqr/)) {
      return '💳 Hình thức thanh toán:\n\n✅ COD (Thanh toán khi nhận hàng)\n✅ Chuyển khoản qua VietQR\n✅ Thẻ tín dụng/Ghi nợ\n\nAn toàn & tiện lợi!';
    }
    
    // Warranty
    if (lowerMessage.match(/bảo hành|warranty|đổi trả|return/)) {
      return '🛡️ Chính sách bảo hành:\n\n✅ Bảo hành 24 tháng\n✅ Đổi mới trong 7 ngày\n✅ Hỗ trợ kỹ thuật trọn đời\n✅ Sửa chữa miễn phí trong BH';
    }
    
    // Contact
    if (lowerMessage.match(/liên hệ|contact|hotline|email|địa chỉ/)) {
      return '📞 Liên hệ:\n\n☎️ Hotline: 1900-xxxx\n📧 Email: support@devialet.vn\n🏢 Địa chỉ: 123 Nguyễn Huệ, Q1, HCM\n\nLàm việc: 8h-20h hàng ngày';
    }
    
    // Default fallback
    return 'Cảm ơn bạn! Tôi có thể giúp bạn về:\n\n🔹 Sản phẩm & Giá cả\n🔹 Giao hàng & Thanh toán\n🔹 Bảo hành & Đổi trả\n🔹 Liên hệ hỗ trợ\n\nBạn muốn biết về vấn đề nào?';
  };

  return (
    <>
      {/* Chat Icon Button */}
      <button 
        className={`chat-icon-button ${isOpen ? 'open' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Chat with us"
      >
        {isOpen ? (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          </svg>
        )}
      </button>

      {/* Chat Popup */}
      {isOpen && (
        <div className="chat-popup">
          <div className="chat-header">
            <div className="chat-header-info">
              <h3>Devialet Support</h3>
              <span className="chat-status">Online</span>
            </div>
          </div>

          <div className="chat-messages">
            {messages.map((message) => (
              <div key={message.id} className={`message ${message.sender}`}>
                <div className="message-bubble">
                  {message.text}
                </div>
                <span className="message-time">
                  {message.timestamp.toLocaleTimeString('vi-VN', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </span>
              </div>
            ))}
            
            {isTyping && (
              <div className="message bot">
                <div className="message-bubble typing">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          <form className="chat-input-form" onSubmit={handleSendMessage}>
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Nhập tin nhắn..."
              className="chat-input"
            />
            <button type="submit" className="chat-send-button" disabled={!inputMessage.trim()}>
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
              </svg>
            </button>
          </form>
        </div>
      )}
    </>
  );
};

export default ChatWidget;
