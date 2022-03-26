from fpdf import FPDF
import plotly.express as px
import plotly
import pandas as pd
import os


class PDF (FPDF):
    def createLayout(self, header=True):
        self.add_page()
        self.rect(5.0, 5.0, 200.0, 287.0)
        self.rect(8.0, 8.0, 194.0, 282.0)
        self.set_xy(0, 0)
        self.set_font("Arial", "B", 25)
        self.set_text_color(0, 0, 0)
        if(header):
            self.cell(w=210, h=30, align="C", txt="Report", border=0)
        self.set_font("Arial", "", 12)

    def addHeader(self, data):
        self.set_xy(40, 10)
        self.cell(w=210, h=30, txt="name:", border=0)
        self.set_xy(140, 10)
        self.cell(w=210, h=30, txt=data["name"], border=0)
        self.set_xy(40, 15)
        self.cell(w=210, h=30, txt="Created:", border=0)
        self.set_xy(140, 15)
        self.cell(w=210, h=30, txt=data["created"], border=0)
        self.set_xy(40, 20)
        self.cell(w=210, h=30, txt="Version:", border=0)
        self.set_xy(140, 20)
        self.cell(w=210, h=30, txt=data["version"], border=0)
        self.set_xy(40, 25)
        self.cell(w=210, h=30, txt="Created by:", border=0)
        self.set_xy(140, 25)
        self.cell(w=210, h=30, txt=data["creator"], border=0)

    def addLC(self, tics, peaks):
        self.set_xy(0, 35)
        self.set_font("Arial", "B", 16)
        self.cell(w=210, h=30, align="C", txt="Liquid Chromatogramm", border=0)
        fig = self.createImage(tics)
        self.set_xy(20, 55.0)
        self.image(fig,  link='', type='', w=700/4, h=450/4)
        self.set_xy(0, 150)
        self.cell(w=210, h=30, align="C", txt="Detected Peaks", border=0)
        self.set_font("Arial", "B", 12)
        self.set_xy(10, 160)
        self.cell(w=210, h=30, align="", txt="RT", border=0)
        self.set_xy(40, 160)
        self.cell(w=210, h=30, align="", txt="Start", border=0)
        self.set_xy(70, 160)
        self.cell(w=210, h=30, align="", txt="End", border=0)
        self.set_xy(100, 160)
        self.cell(w=210, h=30, align="", txt="Window", border=0)
        self.set_xy(130, 160)
        self.cell(w=210, h=30, align="", txt="Component", border=0)
        self.set_xy(160, 160)
        self.cell(w=210, h=30, align="", txt="RT Component", border=0)
        self.set_font("Arial", "", 12)
        for indexRow, peak in enumerate(peaks):
            keys = peak.keys()
            for index, key in enumerate(keys):
                if(key == "id"):
                    continue
                self.set_xy(10 + index * 30, 170 + indexRow * 10)
                self.cell(w=210, h=30, align="", txt=str(peak[key]), border=0)

    def addMS(self, ms, deconMs, peaks, index):
        self.createLayout(header=False)
        self.set_xy(0, 10)
        self.cell(w=210, h=30, align="C", txt=str(index + 1) + ". Peak", border=0)
        self.set_xy(0, 20)
        self.cell(w=210, h=30, align="C", txt="MS and Deconvoluted MS", border=0)
        self.set_xy(20, 40.0)
        fig1 = self.createImage(ms)
        fig2 = self.createImage(deconMs)
        self.image(fig1,  link='', type='', w=700/8, h=450/7)
        self.set_xy(100, 40)
        self.image(fig2,  link='', type='', w=700/8, h=450/7)
        self.set_xy(0, 150)
        self.cell(w=210, h=30, align="C", txt="Detected Peaks", border=0)
        self.set_font("Arial", "B", 12)
        self.set_xy(10, 160)
        self.cell(w=210, h=30, align="", txt="RT", border=0)
        self.set_xy(40, 160)
        self.cell(w=210, h=30, align="", txt="Start", border=0)
        self.set_xy(70, 160)
        self.cell(w=210, h=30, align="", txt="End", border=0)
        self.set_xy(100, 160)
        self.cell(w=210, h=30, align="", txt="Window", border=0)
        self.set_xy(130, 160)
        self.cell(w=210, h=30, align="", txt="Component", border=0)
        self.set_xy(160, 160)
        self.cell(w=210, h=30, align="", txt="RT Component", border=0)
        self.set_font("Arial", "", 12)
        for indexRow, peak in enumerate(peaks):
            keys = peak.keys()
            for index, key in enumerate(keys):
                self.set_xy(10 + index * 30, 170 + indexRow * 10)
                self.cell(w=210, h=30, align="", txt=str(peak[key]), border=0)

    def save(self, name):
        self.output(os.getcwd()+"/static/pdf/" + name + ".pdf", "F")

    def createImage(self, data):
        df = pd.DataFrame.from_records(data)
        fig = px.line(df, x="x", y="y")
        plotly.io.write_image(fig, file='static/tmp.png', format='png', width=700, height=450)
        fig = (os.getcwd()+'/static/'+"tmp.png")
        return fig
