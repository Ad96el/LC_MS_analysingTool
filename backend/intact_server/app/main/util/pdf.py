from fpdf import FPDF
import plotly.express as px
import plotly
import pandas as pd
import os


class PDF (FPDF):
    imageCount = 0

    def createLayout(self, header=True):
        self.add_page()
        self.rect(5.0, 5.0, 200.0, 287.0)
        self.rect(8.0, 8.0, 194.0, 282.0)
        self.set_xy(0, 0)
        self.set_font("Times", "B", 25)
        self.set_text_color(0, 0, 0)
        if(header):
            self.cell(w=210, h=30, align="C", txt="LC-MS Report", border=0)
        self.set_font("Times", "", 12)

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
        self.set_font("Times", "B", 16)
        self.cell(w=210, h=30, align="C", txt="Liquid Chromatogramm", border=0)
        fig = self.createImage(tics)
        self.set_xy(20, 55.0)
        self.image(fig,  link='', type='', w=700/4, h=450/4)
        self.set_xy(0, 150)
        self.cell(w=210, h=30, align="C", txt="Detected Peaks", border=0)
        self.set_font("Times", "B", 12)
        self.set_xy(10, 160)
        self.cell(w=210, h=30, align="", txt="RT", border=0)
        self.set_xy(40, 160)
        self.cell(w=210, h=30, align="", txt="Start", border=0)
        self.set_xy(70, 160)
        self.cell(w=210, h=30, align="", txt="End", border=0)
        self.set_xy(100, 160)
        self.cell(w=210, h=30, align="", txt="RT Comp.", border=0)
        self.set_xy(130, 160)
        self.cell(w=210, h=30, align="", txt="Window", border=0)
        self.set_xy(160, 160)
        self.cell(w=210, h=30, align="", txt="Comp.", border=0)
        self.set_font("Times", "", 12)
        for indexRow, peak in enumerate(peaks):
            keys = peak.keys()
            x = 10
            if(indexRow > 5):
                break
            for key in keys:
                if(key == "id" or key == "y"):
                    continue
                self.set_xy(x, 170 + indexRow * 10)
                self.cell(w=210, h=30, align="", txt=str(peak[key]), border=0)
                x += 30

    def addMS(self, ms, deconMs, peaks, index):
        self.createLayout(header=False)
        self.set_xy(0, 10)
        self.set_font("Times", "B", 16)
        self.cell(w=210, h=30, align="C", txt=str(index + 1) + ". Peak", border=0)
        self.set_xy(0, 20)
        self.set_font("Times", "B", 16)
        self.cell(w=210, h=30, align="C", txt="MS and Deconvoluted MS", border=0)
        self.set_xy(20, 40.0)
        fig1 = self.createImage(ms)
        self.image(fig1,  link='', type='', w=700/4, h=450/6)
        self.set_xy(20, 110)
        fig2 = self.createImage(deconMs)
        self.image(fig2,  link='', type='', w=700/4, h=450/6)
        self.set_xy(0, 170)
        self.set_font("Times", "B", 16)
        self.cell(w=210, h=30, align="C", txt="Detected Peaks", border=0)
        self.set_font("Times", "B", 12)
        self.set_xy(10, 180)
        self.cell(w=210, h=30, align="", txt="Name", border=0)
        self.set_xy(25, 180)
        self.cell(w=210, h=30, align="", txt="Quant.", border=0)
        self.set_xy(40, 180)
        self.cell(w=210, h=30, align="", txt="Mod.", border=0)
        self.set_xy(55, 180)
        self.cell(w=210, h=30, align="", txt="Comp. Mass", border=0)
        self.set_xy(85, 180)
        self.cell(w=210, h=30, align="", txt="Peak Mass", border=0)
        self.set_xy(115, 180)
        self.cell(w=210, h=30, align="", txt="Peak Int.", border=0)
        self.set_xy(145, 180)
        self.cell(w=210, h=30, align="", txt="Score", border=0)
        self.set_xy(175, 180)
        self.cell(w=210, h=30, align="", txt="Error", border=0)
        self.set_font("Times", "", 12)
        for indexRow, peak in enumerate(peaks):
            keys = peak.keys()
            x = 10
            for index, key in enumerate(keys):
                if(key == "id" or key == "glyco" or key == "specToPeak" or key == "modificationQuantity"):
                    continue
                if(index == 0):
                    x = 10
                elif(index < 5):
                    x = x + 15
                else:
                    x = x + 30
                self.set_xy(x, 190 + indexRow * 10)
                self.cell(w=210, h=30, align="", txt=str(peak[key]), border=0)

    def save(self, name):
        self.output(os.getcwd()+"/static/pdf/" + name + ".pdf", "F")
        for count in range(self.imageCount):
            os.remove(os.getcwd()+'/static/' + str(count) + 'tmp.png')

    def createImage(self, data):
        df = pd.DataFrame.from_records(data)
        fig = px.line(df, x="x", y="y",  labels=dict(x="Retention Time", y="Intensity"))
        plotly.io.write_image(fig, file='static/' + str(self.imageCount) + 'tmp.png',
                              format='png', width=700, height=450)
        fig = (os.getcwd()+'/static/' + str(self.imageCount) + "tmp.png")
        self.imageCount += 1
        return fig
