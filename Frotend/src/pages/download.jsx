import React, { useState, useRef } from 'react';
import { Container, Row, Col, Form, Button, Alert, ListGroup } from 'react-bootstrap';
import axios from 'axios';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import cardTop from '../assets/card-top.png';
import cardBot from '../assets/card-bot.png';
import SMIT from '../assets/smit-logo.png';
import nameLogo from '../assets/name-logo.png';
import QRCode from 'react-qr-code';
import '../App.css';

const Download = () => {
  const [cnic, setCnic] = useState('');
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');
  const [loadingStates, setLoadingStates] = useState({});

  const cardRefs = useRef({});

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setUsers([]);
    setLoadingStates({});

    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/user/${cnic}`);
      console.log("API Response:", res.data); 
      
      if (res.data.success) {
        let usersData = [];
        
        if (Array.isArray(res.data.users)) {
          usersData = res.data.users;
        } else if (Array.isArray(res.data.user)) {
          usersData = res.data.user;
        } else if (res.data.user) {
          usersData = [res.data.user];
        }
        
        console.log("Processed Users Data:", usersData);
        setUsers(usersData);
      } else {
        setError('User not found');
      }
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Something went wrong. Please try again.');
    }
  };

  const handleDownloadPDF = async (user) => {
    if (!cardRefs.current[user._id]) return;
    
    setLoadingStates(prev => ({ ...prev, [user._id]: true }));

    try {
      const canvas = await html2canvas(cardRefs.current[user._id], {
        scale: 2,
        useCORS: true,
        allowTaint: true,
      });

      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgProps = pdf.getImageProperties(canvas.toDataURL('image/png'));
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

      pdf.addImage(canvas, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Saylani_ID_Card_${user.course.replace(/\s+/g, '_')}.pdf`);
    } catch (err) {
      console.error('PDF generation failed:', err);
      setError('Failed to generate PDF. Please try again.');
    } finally {
      setLoadingStates(prev => ({ ...prev, [user._id]: false }));
    }
  };

  return (
    <Container>
      <Row className="justify-content-center mt-5">
        <Col md={6} lg={6}>
          <Form onSubmit={handleSubmit}>
            <Form.Group controlId="cnicInput">
              <Form.Label className='lable-color'>CNIC (Without dashes)</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter CNIC without dashes"
                value={cnic}
                onChange={(e) => setCnic(e.target.value.replace(/-/g, ''))}
                className="py-3 border-2 form-border"
                required
                pattern="[0-9]{13}"
                title="Please enter 13-digit CNIC without dashes"
              />
            </Form.Group>
            <Button type="submit" className="w-100 mt-3">Search</Button>
          </Form>

          {error && <Alert variant="danger" className="mt-3">{error}</Alert>}

          {users.length > 0 && (
            <div className="mt-4">
              <h4 className="text-center mb-4">
                <small className="text-muted">Total Courses: {users.length}</small>
              </h4>
              
              <ListGroup>
                {users.map((user) => (
                  <React.Fragment key={user._id}>
                    <ListGroup.Item className="d-flex justify-content-between align-items-center mb-2">
                      <div className="d-flex align-items-center">
                        <img 
                          src={user.imageUrl} 
                          alt="user" 
                          className="rounded-circle me-3"
                          style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                          onError={(e) => {
                            e.target.onerror = null; 
                            e.target.src = 'https://via.placeholder.com/50';
                          }}
                        />
                        <div>
                          <h6 className="mb-0">{user.course}</h6>
                          <small className="text-muted">
                            Registered on: {new Date(user.createdAt).toLocaleDateString()}
                          </small>
                        </div>
                      </div>
                      <Button 
                        variant="success" 
                        size="sm"
                        onClick={() => handleDownloadPDF(user)}
                        disabled={loadingStates[user._id]}
                      >
                        {loadingStates[user._id] ? 'Downloading...' : 'Download ID'}
                      </Button>
                    </ListGroup.Item>

                    <div ref={el => cardRefs.current[user._id] = el} style={{ position: 'absolute', left: '-9999px' }}>
                      <div className="row">
                        <div className="col col-lg-6 col-md-6 col-sm-12">
                          <div className="col col-lg-11 col-md-11 col-sm-12 text-center h-100 d-flex flex-column justify-content-between" 
                               style={{ border: '1px solid #7b7b7b' }}>
                            <img src={cardTop} alt="card-top" className="w-100 mb-1" style={{ height: '50px' }} />
                            <img src={SMIT} alt="SMIT" className="mb-2 mx-auto d-block" style={{ width: '100px', height: '50px' }} />
                            <img src={nameLogo} alt="nameLogo" className="mx-auto d-block mt-2" style={{ width: '150px', height: '50px' }} />
                            <img src={user.imageUrl} alt="user-image" className="mx-auto d-block rounded-sm mt-2" 
                                 style={{ width: '80px', height: '80px', border: '3px solid #8bc441' }} />
                            <h6 className='mt-2'>{user.fullName.toUpperCase()}</h6>
                            <p>{user.course}</p>
                            <img src={cardBot} alt="card-bot" className="w-100" style={{ height: '40px' }} />
                          </div>
                        </div>

                        <div className="col col-lg-6 col-md-6 col-sm-12">
                          <div className="col col-lg-11 col-md-9 col-sm-12 h-100" style={{ border: '1px solid #7b7b7b' }}>
                            <img src={cardTop} alt="card-top" className="w-100 mb-1" style={{ height: '50px' }} />
                            <p className='mx-4 my-0' style={{ fontSize: '15px' }}>Name: <b><u>{user.fullName}</u></b></p>
                            <p className='mx-4 my-0' style={{ fontSize: '15px' }}>Father name: <b><u>{user.fatherName}</u></b></p>
                            <p className='mx-4 my-0' style={{ fontSize: '15px' }}>CNIC: <b><u>{user.cnic}</u></b></p>
                            <p className='mx-4 my-0' style={{ fontSize: '15px' }}>Course: <b><u>{user.course}</u></b></p>
                            <QRCode value={user.cnic} size={64} className="mt-4 mx-auto d-block" />
                            <p className='mx-2 text-center mt-3' style={{ fontSize: '12px' }}>
                              <b>Note: This is for SMIT premises only. <br />If found please return to SMIT</b>
                            </p>
                            <hr className="mx-auto mt-4 mb-2" style={{ width: '50%', borderTop: '2px solid black' }} />
                            <b className='text-center d-block' style={{ fontSize: '12px' }}>Issuing authority</b>
                            <img src={cardBot} alt="card-bot" className="w-100" style={{ height: '40px' }} />
                          </div>
                        </div>
                      </div>
                    </div>
                  </React.Fragment>
                ))}
              </ListGroup>
            </div>
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default Download;