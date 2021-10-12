import React from 'react';
import './App.css';

function About() {
    return (
        <div className="App">
            <header className="App-header">
                <h1 className="App-header-text">Work Experience</h1>
            </header>
            <div className="App-body">
                <div>
                    <h2 className="Act-company">Fluid HPC</h2>
                    <h3 className="Act-title">Development Intern</h3>
                    <p className="Act-desc">
                        Fluid HPC is a platform allowing researchers to easily scale high performance computing workloads on the AWS
                        cloud. I worked as the lead for managing the operating system our customers work on. This included installing
                        necessary HPC software, increasing scaling efficiency, and building demos for customers. I worked extensively
                        on AWS primarily using computing and scaling resources such as EC2, S3, ParallelCluster and CloudFormation.
                        Additionally, I frequently met with customers to discuss timelines and goals for specific projects as the technical
                        lead.
                    </p>
                </div>
            </div>
        </div>
    );
}

export default About;